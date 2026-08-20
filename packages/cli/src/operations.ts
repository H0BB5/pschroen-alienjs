import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

import { createTwoFilesPatch } from 'diff';

import { CONFIG_FILE, getConfigPath, readConfig, requireConfig, writeConfig } from './config.js';
import { AliencnError } from './errors.js';
import {
  planWrites,
  resolveConflicts,
  writePlannedFiles
} from './files.js';
import { installPackages, missingPackages } from './package-manager.js';
import { resolveWithinRoot } from './paths.js';
import { createConfig, detectProject, readPackageJson } from './project.js';
import {
  applicableItems,
  collectPackageDependencies,
  getRegistryItem,
  publicRegistryItems,
  resolveRegistryItems
} from './registry.js';
import { renderRegistryItems, resolveThemeContent, THEME_FILE } from './templates.js';
import type {
  AddOptions,
  AliencnConfig,
  DiffOptions,
  DoctorCheck,
  DoctorReport,
  Framework,
  InitOptions,
  Language,
  ListOptions,
  PackageManager,
  PlannedFile,
  PackageJson,
  RegistryCategory,
  RegistryItem,
  RenderedFile,
  WriteSummary
} from './types.js';

const defaultConfirm = async (): Promise<boolean> => false;

export interface InitResult {
  config: AliencnConfig;
  configPath: string;
  writes: WriteSummary;
  packageManager: PackageManager;
  /** Project-relative path of the written theme stylesheet, when a theme is active. */
  themePath?: string;
  /** Populated instead of `writes` when the operation ran with `dryRun`. */
  plan?: PlannedFile[];
}

export interface AddResult {
  items: string[];
  packages: string[];
  writes: WriteSummary;
  /** Populated instead of `writes` when the operation ran with `dryRun`. */
  plan?: PlannedFile[];
}

const emptyWrites = (): WriteSummary => ({ created: [], overwritten: [], skipped: [] });

export interface ListEntry {
  name: string;
  title: string;
  description: string;
  category: RegistryCategory;
  installed: boolean;
}

export interface DiffEntry {
  item: string;
  path: string;
  state: 'clean' | 'missing' | 'changed';
  patch?: string;
}

export async function initProject(options: InitOptions = {}): Promise<InitResult> {
  const root = path.resolve(options.cwd ?? process.cwd());
  const existing = options.overwrite ? await readConfigTolerant(root) : await readConfig(root);

  if (existing && !options.overwrite) {
    if (!options.theme) {
      return {
        config: existing,
        configPath: getConfigPath(root),
        writes: { created: [], overwritten: [], skipped: [CONFIG_FILE] },
        packageManager: (await detectProject(root, detectionOverrides(existing))).packageManager
      };
    }

    // Theme-only update: an explicit --theme on an initialized project
    // replaces the theme stylesheet without touching anything else.
    const config: AliencnConfig = { ...existing, theme: options.theme };
    const themed = await themeRenderedFile(root, config, options.theme);
    const planned = await planWrites([themed], true, true);
    if (options.dryRun ?? false) {
      return {
        config,
        configPath: getConfigPath(root),
        writes: emptyWrites(),
        packageManager: (await detectProject(root, detectionOverrides(config))).packageManager,
        themePath: themed.relativePath,
        plan: planned
      };
    }
    const writes = await writePlannedFiles(planned);
    await writeConfig(root, config);
    return {
      config,
      configPath: getConfigPath(root),
      writes,
      packageManager: (await detectProject(root, detectionOverrides(config))).packageManager,
      themePath: themed.relativePath
    };
  }

  const project = await detectProject(root, {
    ...(options.framework ? { framework: options.framework } : {}),
    ...(options.language ? { language: options.language } : {}),
    ...(options.path ? { path: options.path } : {})
  });
  const config = createConfig(project, options.path);
  const theme = options.theme ?? existing?.theme;
  if (theme) config.theme = theme;

  const foundation = resolveRegistryItems(['styles']);
  const rendered = await renderRegistryItems(root, config, foundation);
  const themed = theme ? await themeRenderedFile(root, config, theme) : null;
  if (themed) rendered.push(themed);
  const planned = await planWrites(
    rendered,
    options.overwrite ?? false,
    options.overwrite ?? false
  );

  if (options.dryRun ?? false) {
    return {
      config,
      configPath: getConfigPath(root),
      writes: emptyWrites(),
      packageManager: project.packageManager,
      ...(themed ? { themePath: themed.relativePath } : {}),
      plan: planned
    };
  }

  const resolved = await resolveConflicts(
    planned,
    options.confirm ?? defaultConfirm,
    options.yes ?? false
  );
  const writes = await writePlannedFiles(resolved);
  await writeConfig(root, config);

  return {
    config,
    configPath: getConfigPath(root),
    writes,
    packageManager: project.packageManager,
    ...(themed ? { themePath: themed.relativePath } : {})
  };
}

async function readConfigTolerant(root: string): Promise<AliencnConfig | null> {
  try {
    return await readConfig(root);
  } catch {
    // An unreadable or invalid config is being overwritten anyway.
    return null;
  }
}

/**
 * A recorded configuration outranks re-detection: a `static` project has no
 * React marker to detect, so its config is the only source of truth.
 */
function detectionOverrides(
  config: AliencnConfig | null
): { framework?: Framework; language?: Language } {
  return config ? { framework: config.framework, language: config.language } : {};
}

function themePath(config: AliencnConfig): string {
  return path.posix.join(path.posix.dirname(config.paths.styles), THEME_FILE);
}

async function themeRenderedFile(
  root: string,
  config: AliencnConfig,
  theme: string
): Promise<RenderedFile> {
  const relativePath = themePath(config);
  return {
    item: 'theme',
    relativePath,
    absolutePath: resolveWithinRoot(root, relativePath, 'Theme path'),
    content: await resolveThemeContent(theme, root),
    preserve: true
  };
}

export async function addComponents(
  names: readonly string[],
  options: AddOptions = {}
): Promise<AddResult> {
  const root = path.resolve(options.cwd ?? process.cwd());
  const config = await requireConfig(root);
  const items = resolveRegistryItems(names, options.all ?? false);
  const setOverrides = options.set ?? {};
  const declaredOptions = new Set(
    items.flatMap((item) => (item.options ?? []).map((option) => option.name))
  );
  for (const key of Object.keys(setOverrides)) {
    if (!declaredOptions.has(key)) {
      throw new AliencnError(
        'INVALID_ARGUMENT',
        `Unknown option "${key}". The requested components declare: ${[...declaredOptions].join(', ') || 'none'}.`
      );
    }
  }

  const project = await detectProject(root, detectionOverrides(config));
  const packageJson = await readPackageJson(root);
  const packages = missingPackages(
    packageJson,
    collectPackageDependencies(applicableItems(items, config.language))
  );
  const dryRun = options.dryRun ?? false;

  if (!dryRun && !(options.skipInstall ?? false)) {
    await installPackages(root, project.packageManager, packages);
  }

  const rendered = await renderRegistryItems(root, config, items, options.path, setOverrides);
  const planned = await planWrites(rendered, options.overwrite ?? false);
  const publicNames = items.filter((item) => !item.hidden).map((item) => item.name);

  if (dryRun) {
    return { items: publicNames, packages, writes: emptyWrites(), plan: planned };
  }

  const resolved = await resolveConflicts(
    planned,
    options.confirm ?? defaultConfirm,
    options.yes ?? false
  );
  const writes = await writePlannedFiles(resolved);

  return {
    items: publicNames,
    packages,
    writes
  };
}

export async function listComponents(options: ListOptions = {}): Promise<ListEntry[]> {
  const root = path.resolve(options.cwd ?? process.cwd());
  const config = await readConfig(root);
  return Promise.all(
    publicRegistryItems().map(async (item) => ({
      name: item.name,
      title: item.title,
      description: item.description,
      category: item.category,
      installed: config ? await isItemInstalled(root, config, item) : false
    }))
  );
}

export async function diffComponents(
  names: readonly string[],
  options: DiffOptions = {}
): Promise<DiffEntry[]> {
  const root = path.resolve(options.cwd ?? process.cwd());
  const config = await requireConfig(root);
  const items = resolveRegistryItems(names, options.all ?? false).filter((item) => !item.hidden);
  const rendered = await renderRegistryItems(root, config, items, options.path);
  const output: DiffEntry[] = [];

  for (const file of rendered) {
    const actual = await readOptional(file.absolutePath);
    if (actual === null) {
      output.push({ item: file.item, path: file.relativePath, state: 'missing' });
    } else if (actual === file.content) {
      output.push({ item: file.item, path: file.relativePath, state: 'clean' });
    } else {
      output.push({
        item: file.item,
        path: file.relativePath,
        state: 'changed',
        patch: createTwoFilesPatch(
          file.relativePath,
          `registry/${file.item}`,
          actual,
          file.content,
          'installed',
          'expected',
          { context: 3 }
        )
      });
    }
  }
  return output;
}

export async function doctor(options: ListOptions = {}): Promise<DoctorReport> {
  const root = path.resolve(options.cwd ?? process.cwd());
  const checks: DoctorCheck[] = [];
  let config: AliencnConfig | null = null;
  let packageJson: PackageJson | null = null;

  try {
    const project = await detectProject(root, detectionOverrides(await readConfigTolerant(root)));
    packageJson = project.packageJson;
    checks.push({
      name: 'project',
      status: 'pass',
      message: `${project.framework} / ${project.language} / ${project.packageManager}`
    });
    if (project.framework === 'static') {
      checks.push({
        name: 'react',
        status: 'pass',
        message: 'Static framework: React is not required.'
      });
    } else if (!('react' in {
      ...project.packageJson.dependencies,
      ...project.packageJson.devDependencies,
      ...project.packageJson.peerDependencies
    })) {
      checks.push({ name: 'react', status: 'fail', message: 'React is not declared.' });
    } else {
      checks.push({ name: 'react', status: 'pass', message: 'React is declared.' });
    }
  } catch (error) {
    checks.push({
      name: 'project',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Project detection failed.'
    });
  }

  try {
    config = await requireConfig(root);
    checks.push({ name: 'config', status: 'pass', message: `${CONFIG_FILE} is valid.` });
  } catch (error) {
    checks.push({
      name: 'config',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Configuration is invalid.'
    });
  }

  if (config) {
    for (const [name, configuredPath] of Object.entries(config.paths)) {
      try {
        resolveWithinRoot(root, configuredPath, `${name} path`);
        checks.push({ name: `path:${name}`, status: 'pass', message: configuredPath });
      } catch (error) {
        checks.push({
          name: `path:${name}`,
          status: 'fail',
          message: error instanceof Error ? error.message : 'Invalid path.'
        });
      }
    }

    if (await exists(resolveWithinRoot(root, config.paths.styles))) {
      checks.push({ name: 'styles', status: 'pass', message: config.paths.styles });
    } else {
      checks.push({
        name: 'styles',
        status: 'fail',
        message: `Missing ${config.paths.styles}; run aliencn init --overwrite.`
      });
    }

    if (config.theme) {
      const themeFile = themePath(config);
      if (await exists(resolveWithinRoot(root, themeFile))) {
        checks.push({ name: 'theme', status: 'pass', message: `${themeFile} (${config.theme})` });
      } else {
        checks.push({
          name: 'theme',
          status: 'fail',
          message: `Missing ${themeFile}; run aliencn init --theme ${config.theme}.`
        });
      }
    }

    const installed = (await listComponents({ cwd: root })).filter((entry) => entry.installed);
    checks.push({
      name: 'components',
      status: installed.length > 0 ? 'pass' : 'warn',
      message:
        installed.length > 0
          ? `${installed.length} registry component(s) detected.`
          : 'No registry components are installed yet.'
    });

    if (installed.length > 0) {
      try {
        const requiredItems = resolveRegistryItems(installed.map((entry) => entry.name));
        const requiredFiles = await renderRegistryItems(root, config, requiredItems);
        const missingFiles: string[] = [];
        for (const file of requiredFiles) {
          if (!(await exists(file.absolutePath))) missingFiles.push(file.relativePath);
        }
        checks.push({
          name: 'registry-files',
          status: missingFiles.length === 0 ? 'pass' : 'fail',
          message:
            missingFiles.length === 0
              ? 'Installed components and registry foundations are present.'
              : `Missing registry files: ${missingFiles.join(', ')}`
        });
      } catch (error) {
        checks.push({
          name: 'registry-files',
          status: 'fail',
          message: error instanceof Error ? error.message : 'Registry files could not be validated.'
        });
      }
    }

    if (packageJson && installed.length > 0) {
      const dependencies = collectPackageDependencies(
        applicableItems(
          resolveRegistryItems(installed.map((entry) => entry.name)),
          config.language
        )
      );
      const missing = missingPackages(packageJson, dependencies);
      checks.push({
        name: 'dependencies',
        status: missing.length === 0 ? 'pass' : 'fail',
        message:
          missing.length === 0
            ? 'Registry package dependencies are declared.'
            : `Missing package declarations: ${missing.join(', ')}`
      });
    }
  }

  return {
    healthy: !checks.some((check) => check.status === 'fail'),
    checks
  };
}

async function isItemInstalled(
  root: string,
  config: AliencnConfig,
  item: RegistryItem
): Promise<boolean> {
  const rendered = await renderRegistryItems(root, config, resolveRegistryItems([item.name]));
  const ownFiles = rendered.filter((file) => file.item === item.name);
  return ownFiles.length > 0 && (await Promise.all(ownFiles.map((file) => exists(file.absolutePath)))).every(Boolean);
}

async function exists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function readOptional(target: string): Promise<string | null> {
  try {
    return await readFile(target, 'utf8');
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') return null;
    throw new AliencnError('IO_ERROR', `Unable to read ${target}.`, { target }, { cause: error });
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

export function summarizePlannedFiles(files: readonly PlannedFile[]): Record<string, number> {
  return files.reduce<Record<string, number>>((summary, file) => {
    summary[file.action] = (summary[file.action] ?? 0) + 1;
    return summary;
  }, {});
}
