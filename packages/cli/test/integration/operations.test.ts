import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { readConfig } from '../../src/config.js';
import {
  addComponents,
  diffComponents,
  doctor,
  initProject,
  listComponents
} from '../../src/operations.js';
import { copyFixture, removeFixture } from '../helpers.js';

const fixtures: string[] = [];
afterEach(async () => {
  await Promise.all(fixtures.splice(0).map((fixture) => removeFixture(fixture)));
});

describe('project operations', () => {
  it('initializes and idempotently adds multiple components to Next TypeScript', async () => {
    const fixture = await copyFixture('next-ts');
    fixtures.push(fixture);
    const initialized = await initProject({ cwd: fixture, yes: true, skipInstall: true });
    expect(initialized.config).toMatchObject({ framework: 'next', language: 'ts' });
    expect(await readFile(path.join(fixture, 'src/app/aliencn.css'), 'utf8')).toContain(
      '--aliencn-accent'
    );

    const added = await addComponents(['button', 'card', 'panel'], {
      cwd: fixture,
      yes: true,
      skipInstall: true
    });
    expect(added.items).toEqual(['button', 'card', 'panel']);
    expect(added.packages).toContain('@alienkitty/space.js@^1.2.0');
    expect(await readFile(path.join(fixture, 'src/components/aliencn/button.tsx'), 'utf8')).toContain(
      "from '@/lib/aliencn/cn'"
    );

    const repeated = await addComponents(['button', 'card'], {
      cwd: fixture,
      yes: true,
      skipInstall: true
    });
    expect(repeated.writes.created).toEqual([]);
    expect(repeated.writes.overwritten).toEqual([]);
    expect(repeated.writes.skipped.length).toBeGreaterThanOrEqual(4);
  });

  it('preserves conflicts in --yes mode and overwrites only when explicit', async () => {
    const fixture = await copyFixture('next-ts');
    fixtures.push(fixture);
    await initProject({ cwd: fixture, yes: true, skipInstall: true });
    await addComponents(['button'], { cwd: fixture, yes: true, skipInstall: true });
    const buttonPath = path.join(fixture, 'src/components/aliencn/button.tsx');
    await writeFile(buttonPath, '// consumer customization\n', 'utf8');

    const safe = await addComponents(['button'], { cwd: fixture, yes: true, skipInstall: true });
    expect(safe.writes.skipped).toContain('src/components/aliencn/button.tsx');
    expect(await readFile(buttonPath, 'utf8')).toBe('// consumer customization\n');

    const forced = await addComponents(['button'], {
      cwd: fixture,
      yes: true,
      overwrite: true,
      skipInstall: true
    });
    expect(forced.writes.overwritten).toContain('src/components/aliencn/button.tsx');
    expect(await readFile(buttonPath, 'utf8')).toContain('export interface ButtonProps');
  });

  it('supports path overrides without changing the stored config', async () => {
    const fixture = await copyFixture('next-ts');
    fixtures.push(fixture);
    await initProject({ cwd: fixture, yes: true, skipInstall: true });
    await addComponents(['badge'], {
      cwd: fixture,
      path: 'src/features/demo/ui',
      yes: true,
      skipInstall: true
    });
    expect(await readFile(path.join(fixture, 'src/features/demo/ui/badge.tsx'), 'utf8')).toContain(
      'export interface BadgeProps'
    );
    expect((await readConfig(fixture))?.paths.components).toBe('src/components/aliencn');
  });

  it('restores CSS only through explicit init overwrite', async () => {
    const fixture = await copyFixture('next-ts');
    fixtures.push(fixture);
    await initProject({ cwd: fixture, yes: true, skipInstall: true });
    const stylesPath = path.join(fixture, 'src/app/aliencn.css');
    await writeFile(stylesPath, 'custom theme\n', 'utf8');

    await addComponents(['button'], {
      cwd: fixture,
      yes: true,
      overwrite: true,
      skipInstall: true
    });
    expect(await readFile(stylesPath, 'utf8')).toBe('custom theme\n');

    await initProject({
      cwd: fixture,
      yes: true,
      overwrite: true,
      skipInstall: true
    });
    expect(await readFile(stylesPath, 'utf8')).toContain('--aliencn-accent');
  });

  it('repairs an invalid config only when overwrite is explicit', async () => {
    const fixture = await copyFixture('next-ts');
    fixtures.push(fixture);
    const configPath = path.join(fixture, 'aliencn.json');
    await writeFile(configPath, '{ invalid json\n', 'utf8');

    await expect(initProject({ cwd: fixture, yes: true, skipInstall: true })).rejects.toMatchObject({
      code: 'CONFIG_INVALID'
    });

    const repaired = await initProject({
      cwd: fixture,
      yes: true,
      overwrite: true,
      skipInstall: true
    });
    expect(repaired.config.framework).toBe('next');
    await expect(readConfig(fixture)).resolves.toMatchObject({ version: 1 });
  });

  it('lists, diffs, and diagnoses current state', async () => {
    const fixture = await copyFixture('next-ts');
    fixtures.push(fixture);
    await initProject({ cwd: fixture, yes: true, skipInstall: true });
    await addComponents(['button'], { cwd: fixture, yes: true, skipInstall: true });

    const listed = await listComponents({ cwd: fixture });
    expect(listed.find((entry) => entry.name === 'button')?.installed).toBe(true);
    expect((await diffComponents(['button'], { cwd: fixture }))).toEqual(
      expect.arrayContaining([expect.objectContaining({ state: 'clean' })])
    );

    const buttonPath = path.join(fixture, 'src/components/aliencn/button.tsx');
    await writeFile(buttonPath, '// drift\n', 'utf8');
    const changed = await diffComponents(['button'], { cwd: fixture });
    expect(changed).toEqual([
      expect.objectContaining({ state: 'changed', patch: expect.stringContaining('-// drift') })
    ]);
    expect((await doctor({ cwd: fixture })).healthy).toBe(true);
  });

  it('installs the interim upstream type shims for TypeScript projects only', async () => {
    const tsFixture = await copyFixture('next-ts');
    fixtures.push(tsFixture);
    await initProject({ cwd: tsFixture, yes: true, skipInstall: true });
    const tsAdd = await addComponents(['panel', 'shader-canvas'], {
      cwd: tsFixture,
      yes: true,
      skipInstall: true
    });
    expect(tsAdd.packages).toContain('@types/three@^0.185.1');
    expect(
      await readFile(path.join(tsFixture, 'src/components/aliencn/space-types.d.ts'), 'utf8')
    ).toContain("declare module '@alienkitty/space.js'");
    expect(
      await readFile(path.join(tsFixture, 'src/components/aliencn/alien-types.d.ts'), 'utf8')
    ).toContain("declare module '@alienkitty/alien.js/three'");

    const jsFixture = await copyFixture('vite-js');
    fixtures.push(jsFixture);
    await initProject({ cwd: jsFixture, yes: true, skipInstall: true });
    const jsAdd = await addComponents(['panel', 'shader-canvas'], {
      cwd: jsFixture,
      yes: true,
      skipInstall: true
    });
    expect(jsAdd.packages).not.toContain('@types/three@^0.185.1');
    expect(jsAdd.writes.created).not.toContainEqual(expect.stringContaining('types.d'));
  });

  it('plans without writing or installing under dry-run', async () => {
    const fixture = await copyFixture('next-ts');
    fixtures.push(fixture);
    await initProject({ cwd: fixture, yes: true, skipInstall: true });

    const dry = await addComponents(['button'], { cwd: fixture, dryRun: true });
    expect(dry.plan).toBeDefined();
    expect(dry.plan).toContainEqual(
      expect.objectContaining({
        action: 'create',
        relativePath: 'src/components/aliencn/button.tsx'
      })
    );
    expect(dry.writes).toEqual({ created: [], overwritten: [], skipped: [] });
    await expect(
      readFile(path.join(fixture, 'src/components/aliencn/button.tsx'), 'utf8')
    ).rejects.toMatchObject({ code: 'ENOENT' });

    const dryInit = await initProject({ cwd: fixture, overwrite: true, dryRun: true });
    expect(dryInit.plan).toBeDefined();
    expect((await readConfig(fixture))?.version).toBe(1);
  });

  it('reports a missing registry foundation for an installed component', async () => {
    const fixture = await copyFixture('next-ts');
    fixtures.push(fixture);
    await initProject({ cwd: fixture, yes: true, skipInstall: true });
    await addComponents(['button'], { cwd: fixture, yes: true, skipInstall: true });
    await rm(path.join(fixture, 'src/lib/aliencn/cn.ts'));

    const report = await doctor({ cwd: fixture });
    expect(report.healthy).toBe(false);
    expect(report.checks).toContainEqual(
      expect.objectContaining({ name: 'registry-files', status: 'fail' })
    );
  });
});
