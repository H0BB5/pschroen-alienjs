import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { planWrites, resolveConflicts, writePlannedFiles } from '../../src/files.js';
import type { RenderedFile } from '../../src/types.js';
import { copyFixture, removeFixture } from '../helpers.js';

const fixtures: string[] = [];
afterEach(async () => {
  await Promise.all(fixtures.splice(0).map((fixture) => removeFixture(fixture)));
});

describe('safe writes', () => {
  it('creates, skips identical content, and requires conflict resolution', async () => {
    const fixture = await copyFixture('vite-js');
    fixtures.push(fixture);
    const absolutePath = path.join(fixture, 'src', 'created.js');
    const rendered: RenderedFile = {
      item: 'test',
      relativePath: 'src/created.js',
      absolutePath,
      content: 'export const value = 1;\n',
      preserve: false
    };

    const initial = await planWrites([rendered]);
    expect(initial[0]?.action).toBe('create');
    await writePlannedFiles(initial);
    expect(await readFile(absolutePath, 'utf8')).toBe(rendered.content);
    expect((await planWrites([rendered]))[0]?.action).toBe('skip');

    await writeFile(absolutePath, 'user change\n', 'utf8');
    const conflict = await planWrites([rendered]);
    expect(conflict[0]?.action).toBe('conflict');
    const preserved = await resolveConflicts(conflict, async () => false);
    expect(preserved[0]?.action).toBe('skip');
    const accepted = await resolveConflicts(conflict, async () => true);
    expect(accepted[0]?.action).toBe('overwrite');
  });

  it('always preserves foundation files marked preserve', async () => {
    const fixture = await copyFixture('vite-js');
    fixtures.push(fixture);
    const absolutePath = path.join(fixture, 'src', 'theme.css');
    await writeFile(absolutePath, '/* customized */\n', 'utf8');
    const plan = await planWrites([
      {
        item: 'styles',
        relativePath: 'src/theme.css',
        absolutePath,
        content: ':root {}\n',
        preserve: true
      }
    ], true);
    expect(plan[0]?.action).toBe('skip');

    const restoration = await planWrites([
      {
        item: 'styles',
        relativePath: 'src/theme.css',
        absolutePath,
        content: ':root {}\n',
        preserve: true
      }
    ], true, true);
    expect(restoration[0]?.action).toBe('overwrite');
  });
});
