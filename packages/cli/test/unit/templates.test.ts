import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import packageJson from '../../package.json';
import { createProgram } from '../../src/cli.js';
import { createConfig, detectProject } from '../../src/project.js';
import { resolveRegistryItems } from '../../src/registry.js';
import { renderRegistryItems } from '../../src/templates.js';
import { copyFixture, packageDirectory, removeFixture } from '../helpers.js';

const fixtures: string[] = [];
afterEach(async () => {
  await Promise.all(fixtures.splice(0).map((fixture) => removeFixture(fixture)));
});

describe('single-source templates', () => {
  it('uses package.json as the CLI version source of truth', () => {
    expect(createProgram().version()).toBe(packageJson.version);
  });

  it('renders TypeScript with the detected project alias', async () => {
    const fixture = await copyFixture('next-ts');
    fixtures.push(fixture);
    const config = createConfig(await detectProject(fixture));
    const rendered = await renderRegistryItems(
      fixture,
      config,
      resolveRegistryItems(['button'])
    );
    const button = rendered.find((file) => file.item === 'button');
    expect(button?.relativePath).toBe('src/components/aliencn/button.tsx');
    expect(button?.content).toContain("from '@/lib/aliencn/cn'");
    expect(button?.content).toContain('export interface ButtonProps');
  });

  it('transpiles the same canonical template to JavaScript and relative imports', async () => {
    const fixture = await copyFixture('vite-js');
    fixtures.push(fixture);
    const config = createConfig(await detectProject(fixture));
    const rendered = await renderRegistryItems(
      fixture,
      config,
      resolveRegistryItems(['button'])
    );
    const button = rendered.find((file) => file.item === 'button');
    expect(button?.relativePath).toBe('src/components/aliencn/button.jsx');
    expect(button?.content).toContain("from '../../lib/aliencn/cn'");
    expect(button?.content).not.toMatch(/\binterface\s+ButtonProps\b/u);
    expect(button?.content).not.toMatch(/:\s*ButtonProps\b/u);
  });

  it('copies verbatim motion modules byte-for-byte in both languages', async () => {
    const templateRoot = path.join(packageDirectory(), 'templates', 'registry');
    const fixtureNames: ReadonlyArray<'next-ts' | 'vite-js'> = ['next-ts', 'vite-js'];
    for (const fixtureName of fixtureNames) {
      const fixture = await copyFixture(fixtureName);
      fixtures.push(fixture);
      const config = createConfig(await detectProject(fixture));
      const rendered = await renderRegistryItems(
        fixture,
        config,
        resolveRegistryItems(['motion'])
      );
      const modules = rendered.filter((file) => file.item === 'motion');
      expect(modules.map((file) => path.posix.basename(file.relativePath)).sort()).toEqual([
        'GlitchText.js',
        'PageTransition.js',
        'SmoothScroll.js',
        'Title.js',
        'UIUtils.js'
      ]);
      for (const file of modules) {
        const source = await readFile(
          path.join(templateRoot, 'motion', path.posix.basename(file.relativePath)),
          'utf8'
        );
        expect(file.content).toBe(source);
      }
      const shims = rendered.filter((file) => file.item === 'motion-types');
      expect(shims.length).toBe(config.language === 'ts' ? 5 : 0);
    }
  });

  it('keeps consumer handlers from replacing internal dialog and switch behavior', async () => {
    const templateRoot = path.join(packageDirectory(), 'templates', 'registry');
    const dialog = await readFile(path.join(templateRoot, 'dialog.tsx'), 'utf8');
    const toggle = await readFile(path.join(templateRoot, 'switch.tsx'), 'utf8');
    expect(dialog).toContain("'onCancel' | 'onClose'");
    expect(dialog.indexOf('{...props}')).toBeLessThan(dialog.indexOf('onCancel='));
    expect(toggle).toContain("'onChange' | 'onClick'");
    expect(toggle.indexOf('{...props}')).toBeLessThan(toggle.indexOf('onClick='));
  });
});
