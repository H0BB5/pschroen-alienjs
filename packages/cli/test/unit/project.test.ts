import { afterEach, describe, expect, it } from 'vitest';

import { createConfig, detectFramework, detectProject } from '../../src/project.js';
import type { PackageJson } from '../../src/types.js';
import { copyFixture, removeFixture } from '../helpers.js';

const fixtures: string[] = [];
afterEach(async () => {
  await Promise.all(fixtures.splice(0).map((fixture) => removeFixture(fixture)));
});

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
      aliasPrefix: '@'
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
      aliasPrefix: null
    });
    expect(createConfig(project).aliases).toEqual({ components: null, utils: null });
  });

  it('requires React unless the caller explicitly overrides detection', () => {
    const packageJson: PackageJson = { dependencies: { vue: '^3.0.0' } };
    expect(() => detectFramework(packageJson)).toThrow(/requires a React project/);
  });
});
