import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  createConfig,
  detectFramework,
  detectPackageManager,
  detectProject,
  readPackageJson
} from '../../src/project.js';
import type { PackageJson } from '../../src/types.js';
import { copyFixture, packageDirectory, removeFixture } from '../helpers.js';

const fixtures: string[] = [];
afterEach(async () => {
  await Promise.all(fixtures.splice(0).map((fixture) => removeFixture(fixture)));
});

async function makeProject(files: Record<string, string>): Promise<string> {
  const temporaryRoot = path.join(packageDirectory(), '.test-tmp');
  await mkdir(temporaryRoot, { recursive: true });
  const root = await mkdtemp(path.join(temporaryRoot, 'adhoc-'));
  for (const [relativePath, content] of Object.entries(files)) {
    const target = path.join(root, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, 'utf8');
  }
  fixtures.push(root);
  return root;
}

describe('project detection', () => {
  it('detects Next, TypeScript, aliases, and npm', async () => {
    const fixture = await copyFixture('next-ts');
    fixtures.push(fixture);
    const project = await detectProject(fixture);
    expect(project).toMatchObject({
      framework: 'next',
      language: 'ts',
      packageManager: 'npm',
      sourceRoot: 'src',
      appRouter: true,
      aliasMappings: [{ prefix: '@', target: 'src' }]
    });
    expect(createConfig(project)).toMatchObject({
      paths: {
        components: 'src/components/aliencn',
        utils: 'src/lib/aliencn',
        styles: 'src/app/aliencn.css'
      },
      aliases: {
        components: '@/components/aliencn',
        utils: '@/lib/aliencn'
      }
    });
  });

  it('detects Vite JavaScript without inventing an alias', async () => {
    const fixture = await copyFixture('vite-js');
    fixtures.push(fixture);
    const project = await detectProject(fixture);
    expect(project).toMatchObject({
      framework: 'vite',
      language: 'js',
      aliasMappings: []
    });
    expect(createConfig(project).aliases).toEqual({ components: null, utils: null });
  });

  it('requires React unless the caller explicitly overrides detection', () => {
    const packageJson: PackageJson = { dependencies: { vue: '^3.0.0' } };
    expect(() => detectFramework(packageJson)).toThrow(/requires a React project/);
  });

  it('derives aliases from the actual paths mapping target', async () => {
    const root = await makeProject({
      'package.json': JSON.stringify({ name: 'a', dependencies: { react: '^19.0.0' } }),
      'tsconfig.json': JSON.stringify({
        compilerOptions: { paths: { '@/*': ['./*'] } }
      }),
      'src/.gitkeep': ''
    });
    const project = await detectProject(root);
    expect(project.aliasMappings).toEqual([{ prefix: '@', target: '' }]);
    // A root-mapped alias must keep the src segment or the import breaks.
    expect(createConfig(project).aliases).toEqual({
      components: '@/src/components/aliencn',
      utils: '@/src/lib/aliencn'
    });
  });

  it('falls back to relative imports when no mapping covers the output path', async () => {
    const root = await makeProject({
      'package.json': JSON.stringify({ name: 'a', dependencies: { react: '^19.0.0' } }),
      'tsconfig.json': JSON.stringify({
        compilerOptions: { paths: { '~/*': ['./app/*'] } }
      })
    });
    const project = await detectProject(root);
    expect(project.aliasMappings).toEqual([{ prefix: '~', target: 'app' }]);
    // Components land in components/aliencn, outside the app mapping.
    expect(createConfig(project).aliases).toEqual({ components: null, utils: null });
  });

  it('resolves paths mappings through an extends chain', async () => {
    const root = await makeProject({
      'package.json': JSON.stringify({ name: 'a', dependencies: { react: '^19.0.0' } }),
      'tsconfig.base.json': JSON.stringify({
        compilerOptions: { paths: { '@/*': ['./src/*'] } }
      }),
      'tsconfig.json': JSON.stringify({ extends: './tsconfig.base.json' }),
      'src/.gitkeep': ''
    });
    const project = await detectProject(root);
    expect(project.aliasMappings).toEqual([{ prefix: '@', target: 'src' }]);
    expect(createConfig(project).aliases.components).toBe('@/components/aliencn');
  });

  it('detects the workspace package manager from an ancestor lockfile', async () => {
    const root = await makeProject({
      'pnpm-lock.yaml': '',
      'packages/app/package.json': JSON.stringify({
        name: 'app',
        dependencies: { react: '^19.0.0' }
      })
    });
    const app = path.join(root, 'packages', 'app');
    const manifest = await readPackageJson(app);
    expect(await detectPackageManager(app, manifest)).toBe('pnpm');
  });

  it('writes Next styles outside app/ when there is no App Router directory', async () => {
    const root = await makeProject({
      'package.json': JSON.stringify({ name: 'a', dependencies: { next: '^16.0.0', react: '^19.0.0' } }),
      'src/pages/.gitkeep': ''
    });
    const project = await detectProject(root);
    expect(project.appRouter).toBe(false);
    expect(createConfig(project).paths.styles).toBe('src/styles/aliencn.css');
  });
});
