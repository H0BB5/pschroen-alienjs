import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

import ts from 'typescript';
import { z } from 'zod';

import { CONFIG_SCHEMA_URL } from './config.js';
import { AliencnError } from './errors.js';
import { normalizeProjectPath, toPosix } from './paths.js';
import type {
  AliasMapping,
  AliencnConfig,
  Framework,
  Language,
  PackageJson,
  PackageManager,
  ProjectInfo
} from './types.js';

const packageJsonSchema = z
  .object({
    name: z.string().optional(),
    private: z.boolean().optional(),
    packageManager: z.string().optional(),
    dependencies: z.record(z.string()).optional(),
    devDependencies: z.record(z.string()).optional(),
    peerDependencies: z.record(z.string()).optional()
  })
  .passthrough();

export async function detectProject(
  cwd: string,
  overrides: { framework?: Framework; language?: Language; path?: string } = {}
): Promise<ProjectInfo> {
  const root = path.resolve(cwd);
  const packageJson = await readPackageJson(root);
  const framework = overrides.framework ?? detectFramework(packageJson);
  const language = overrides.language ?? (await detectLanguage(root));
  const packageManager = await detectPackageManager(root, packageJson);
  const sourceRoot = (await exists(path.join(root, 'src'))) ? 'src' : '';
  const appRouter =
    framework === 'next' &&
    (await exists(sourceRoot ? path.join(root, sourceRoot, 'app') : path.join(root, 'app')));
  const aliasMappings = await detectAliasMappings(root);

  return {
    root,
    framework,
    language,
    packageManager,
    sourceRoot,
    appRouter,
    aliasMappings,
    packageJson
  };
}

export function createConfig(project: ProjectInfo, componentPath?: string): AliencnConfig {
  const prefix = project.sourceRoot ? `${project.sourceRoot}/` : '';
  const components = normalizeProjectPath(
    componentPath ?? `${prefix}components/aliencn`,
    'Component path'
  );
  const utils = normalizeProjectPath(`${prefix}lib/aliencn`, 'Utility path');
  const styles = normalizeProjectPath(
    project.framework === 'next' && project.appRouter
      ? `${prefix}app/aliencn.css`
      : `${prefix}styles/aliencn.css`,
    'Styles path'
  );

  return {
    $schema: CONFIG_SCHEMA_URL,
    version: 1,
    framework: project.framework,
    language: project.language,
    paths: { components, utils, styles },
    aliases: {
      components: aliasFor(project.aliasMappings, components),
      utils: aliasFor(project.aliasMappings, utils)
    }
  };
}

export async function readPackageJson(root: string): Promise<PackageJson> {
  const packagePath = path.join(root, 'package.json');
  let source: string;
  try {
    source = await readFile(packagePath, 'utf8');
  } catch (error) {
    throw new AliencnError(
      'PROJECT_UNSUPPORTED',
      'No readable package.json was found in the target project.',
      { packagePath },
      { cause: error }
    );
  }

  try {
    const value: unknown = JSON.parse(source);
    return packageJsonSchema.parse(value);
  } catch (error) {
    throw new AliencnError(
      'PROJECT_UNSUPPORTED',
      'The target package.json contains invalid JSON.',
      { packagePath },
      { cause: error }
    );
  }
}

export function detectFramework(packageJson: PackageJson): Framework {
  const dependencies = allDependencies(packageJson);
  if ('next' in dependencies) return 'next';
  if ('vite' in dependencies && 'react' in dependencies) return 'vite';
  if ('react' in dependencies) return 'react';

  throw new AliencnError(
    'PROJECT_UNSUPPORTED',
    'Aliencn requires a React project. Add React or pass --framework after confirming the target.'
  );
}

export async function detectLanguage(root: string): Promise<Language> {
  if (
    (await exists(path.join(root, 'tsconfig.json'))) ||
    (await exists(path.join(root, 'src', 'vite-env.d.ts'))) ||
    (await exists(path.join(root, 'next-env.d.ts')))
  ) {
    return 'ts';
  }
  return 'js';
}

const lockfileCandidates: readonly [PackageManager, string[]][] = [
  ['pnpm', ['pnpm-lock.yaml']],
  ['yarn', ['yarn.lock']],
  ['bun', ['bun.lock', 'bun.lockb']],
  ['npm', ['package-lock.json']]
];

export async function detectPackageManager(
  root: string,
  packageJson: PackageJson
): Promise<PackageManager> {
  // Workspaces keep the lockfile and `packageManager` declaration at the
  // repository root, so walk toward the filesystem root before defaulting.
  let directory = root;
  let manifest: PackageJson | null = packageJson;

  for (;;) {
    const declared = declaredPackageManager(manifest);
    if (declared) return declared;

    for (const [manager, files] of lockfileCandidates) {
      for (const file of files) {
        if (await exists(path.join(directory, file))) return manager;
      }
    }

    const parent = path.dirname(directory);
    if (parent === directory) return 'npm';
    directory = parent;
    manifest = await readOptionalPackageJson(directory);
  }
}

function declaredPackageManager(manifest: PackageJson | null): PackageManager | null {
  const declared = manifest?.packageManager?.split('@')[0];
  if (declared === 'npm' || declared === 'pnpm' || declared === 'yarn' || declared === 'bun') {
    return declared;
  }
  return null;
}

async function readOptionalPackageJson(directory: string): Promise<PackageJson | null> {
  try {
    const value: unknown = JSON.parse(
      await readFile(path.join(directory, 'package.json'), 'utf8')
    );
    return packageJsonSchema.parse(value);
  } catch {
    return null;
  }
}

export function allDependencies(packageJson: PackageJson): Record<string, string> {
  return {
    ...packageJson.peerDependencies,
    ...packageJson.devDependencies,
    ...packageJson.dependencies
  };
}

async function detectAliasMappings(root: string): Promise<AliasMapping[]> {
  for (const file of ['tsconfig.json', 'jsconfig.json']) {
    const configPath = path.join(root, file);
    if (!(await exists(configPath))) continue;

    // getParsedCommandLineOfConfigFile resolves `extends` chains, including
    // array form and package specifiers, which a raw JSONC parse would miss.
    const parsed = ts.getParsedCommandLineOfConfigFile(configPath, undefined, {
      fileExists: ts.sys.fileExists,
      readFile: ts.sys.readFile,
      readDirectory: ts.sys.readDirectory,
      getCurrentDirectory: ts.sys.getCurrentDirectory,
      useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
      onUnRecoverableConfigFileDiagnostic: () => undefined
    });
    const paths = parsed?.options.paths;
    if (!paths) continue;

    // Wildcard targets resolve against baseUrl when set, otherwise the
    // directory of the config file that is being parsed.
    const base = parsed.options.baseUrl ?? root;
    const mappings: AliasMapping[] = [];
    for (const [key, targets] of Object.entries(paths)) {
      if (!key.endsWith('/*') || key.length <= 2) continue;
      const prefix = key.slice(0, -2);
      for (const value of targets) {
        if (!value.endsWith('*')) continue;
        const targetBase = value.slice(0, -1).replace(/\/+$/u, '');
        const absolute = path.resolve(base, targetBase === '' ? '.' : targetBase);
        const relative = path.relative(root, absolute);
        if (relative.startsWith('..') || path.isAbsolute(relative)) continue;
        mappings.push({ prefix, target: toPosix(relative) });
        break;
      }
    }
    if (mappings.length > 0) return mappings;
  }
  return [];
}

function aliasFor(mappings: readonly AliasMapping[], projectPath: string): string | null {
  for (const mapping of mappings) {
    if (mapping.target === '') return `${mapping.prefix}/${projectPath}`;
    if (projectPath === mapping.target) return mapping.prefix;
    if (projectPath.startsWith(`${mapping.target}/`)) {
      return `${mapping.prefix}/${projectPath.slice(mapping.target.length + 1)}`;
    }
  }
  return null;
}

async function exists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}
