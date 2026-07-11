import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

import ts from 'typescript';
import { z } from 'zod';

import { AliencnError } from './errors.js';
import { normalizeProjectPath } from './paths.js';
import type {
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

const editorConfigSchema = z
  .object({
    compilerOptions: z
      .object({
        paths: z.record(z.array(z.string())).optional()
      })
      .passthrough()
      .optional()
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
  const aliasPrefix = await detectAliasPrefix(root);

  return {
    root,
    framework,
    language,
    packageManager,
    sourceRoot,
    aliasPrefix,
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
    project.framework === 'next'
      ? `${prefix}app/aliencn.css`
      : `${prefix}styles/aliencn.css`,
    'Styles path'
  );

  return {
    $schema:
      'https://raw.githubusercontent.com/H0BB5/pschroen-alienjs/main/packages/cli/schema.json',
    version: 1,
    framework: project.framework,
    language: project.language,
    paths: { components, utils, styles },
    aliases: {
      components: aliasFor(project.aliasPrefix, components, project.sourceRoot),
      utils: aliasFor(project.aliasPrefix, utils, project.sourceRoot)
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

export async function detectPackageManager(
  root: string,
  packageJson: PackageJson
): Promise<PackageManager> {
  const declared = packageJson.packageManager?.split('@')[0];
  if (declared === 'npm' || declared === 'pnpm' || declared === 'yarn' || declared === 'bun') {
    return declared;
  }

  const candidates: readonly [PackageManager, string[]][] = [
    ['pnpm', ['pnpm-lock.yaml']],
    ['yarn', ['yarn.lock']],
    ['bun', ['bun.lock', 'bun.lockb']],
    ['npm', ['package-lock.json']]
  ];

  for (const [manager, files] of candidates) {
    for (const file of files) {
      if (await exists(path.join(root, file))) return manager;
    }
  }
  return 'npm';
}

export function allDependencies(packageJson: PackageJson): Record<string, string> {
  return {
    ...packageJson.peerDependencies,
    ...packageJson.devDependencies,
    ...packageJson.dependencies
  };
}

async function detectAliasPrefix(root: string): Promise<string | null> {
  for (const file of ['tsconfig.json', 'jsconfig.json']) {
    const configPath = path.join(root, file);
    try {
      const source = await readFile(configPath, 'utf8');
      const parsed = ts.parseConfigFileTextToJson(configPath, source);
      if (parsed.error) continue;
      const value: unknown = parsed.config;
      const config = editorConfigSchema.parse(value);
      const keys = Object.keys(config.compilerOptions?.paths ?? {});
      const wildcard = keys.find((key) => key.endsWith('/*'));
      if (wildcard) return wildcard.slice(0, -2);
    } catch {
      // Invalid or absent editor config should not prevent project detection.
    }
  }
  return null;
}

function aliasFor(aliasPrefix: string | null, projectPath: string, sourceRoot: string): string | null {
  if (!aliasPrefix) return null;
  const withoutSource =
    sourceRoot && projectPath.startsWith(`${sourceRoot}/`)
      ? projectPath.slice(sourceRoot.length + 1)
      : projectPath;
  return `${aliasPrefix}/${withoutSource}`.replace(/\/+/gu, '/');
}

async function exists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}
