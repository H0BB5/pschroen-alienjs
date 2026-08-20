import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { runCli, type CliIO, type SelectChoice } from '../../src/cli.js';
import { copyFixture, removeFixture } from '../helpers.js';

const fixtures: string[] = [];
afterEach(async () => {
  await Promise.all(fixtures.splice(0).map((fixture) => removeFixture(fixture)));
});

interface RecordedIO extends CliIO {
  out: string[];
  err: string[];
}

function recordedIO(options: {
  confirm?: boolean;
  select?: string[];
} = {}): RecordedIO {
  const out: string[] = [];
  const err: string[] = [];
  return {
    out,
    err,
    stdout: (message) => out.push(message),
    stderr: (message) => err.push(message),
    confirm: () => Promise.resolve(options.confirm ?? true),
    ...(options.select
      ? {
          select: (_message: string, _choices: readonly SelectChoice[]) =>
            Promise.resolve(options.select ?? [])
        }
      : {})
  };
}

async function initialized(): Promise<string> {
  const fixture = await copyFixture('next-ts');
  fixtures.push(fixture);
  const io = recordedIO();
  expect(await runCli(['init', '--cwd', fixture, '--yes', '--skip-install'], io)).toBe(0);
  return fixture;
}

describe('cli surface', () => {
  it('initializes with detection output and honours cancellation with a non-zero exit', async () => {
    const fixture = await copyFixture('next-ts');
    fixtures.push(fixture);

    const cancelled = recordedIO({ confirm: false });
    expect(await runCli(['init', '--cwd', fixture, '--skip-install'], cancelled)).toBe(1);
    expect(cancelled.out.join('\n')).toContain('Initialization cancelled.');

    const io = recordedIO({ confirm: true });
    expect(await runCli(['init', '--cwd', fixture, '--skip-install'], io)).toBe(0);
    const output = io.out.join('\n');
    expect(output).toContain('Created');
    expect(output).toContain('Detected next, ts, and npm.');
  });

  it('previews init and add without touching the project under --dry-run', async () => {
    const fixture = await copyFixture('next-ts');
    fixtures.push(fixture);
    const io = recordedIO();
    expect(await runCli(['init', '--cwd', fixture, '--dry-run'], io)).toBe(0);
    const output = io.out.join('\n');
    expect(output).toContain('Would create');
    expect(output).toContain('Dry run: nothing was written.');
    await expect(readFile(path.join(fixture, 'aliencn.json'), 'utf8')).rejects.toMatchObject({
      code: 'ENOENT'
    });

    await runCli(['init', '--cwd', fixture, '--yes', '--skip-install'], recordedIO());
    const addIO = recordedIO();
    expect(await runCli(['add', 'badge', '--cwd', fixture, '--dry-run'], addIO)).toBe(0);
    const addOutput = addIO.out.join('\n');
    expect(addOutput).toContain('would create');
    expect(addOutput).toContain('Dry run: nothing was written or installed.');
  });

  it('adds components, reports up-to-date reruns, and surfaces manual installs', async () => {
    const fixture = await initialized();
    const io = recordedIO();
    expect(
      await runCli(['add', 'badge', 'panel', '--cwd', fixture, '--yes', '--skip-install'], io)
    ).toBe(0);
    const output = io.out.join('\n');
    expect(output).toContain('Added badge, panel.');
    expect(output).toContain('create');
    expect(output).toContain('Install manually:');
    expect(output).toContain('@alienkitty/space.js@^1.2.0');

    const repeat = recordedIO();
    expect(
      await runCli(['add', 'badge', '--cwd', fixture, '--yes', '--skip-install'], repeat)
    ).toBe(0);
    expect(repeat.out.join('\n')).toContain('already up to date');
  });

  it('offers a picker for bare add and fails cleanly when nothing is chosen', async () => {
    const fixture = await initialized();

    const picked = recordedIO({ select: ['badge'] });
    expect(await runCli(['add', '--cwd', fixture, '--yes', '--skip-install'], picked)).toBe(0);
    expect(picked.out.join('\n')).toContain('Added badge.');

    const empty = recordedIO({ select: [] });
    expect(await runCli(['add', '--cwd', fixture, '--yes', '--skip-install'], empty)).toBe(1);
    expect(empty.out.join('\n')).toContain('No components selected.');
  });

  it('lists, diffs, and doctors the project with JSON support', async () => {
    const fixture = await initialized();
    await runCli(['add', 'badge', '--cwd', fixture, '--yes', '--skip-install'], recordedIO());

    const list = recordedIO();
    expect(await runCli(['list', '--cwd', fixture, '--json'], list)).toBe(0);
    const entries: unknown = JSON.parse(list.out.join('\n'));
    expect(entries).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'badge', installed: true })])
    );

    const clean = recordedIO();
    expect(await runCli(['diff', 'badge', '--cwd', fixture], clean)).toBe(0);
    expect(clean.out.join('\n')).toContain('clean');

    await writeFile(
      path.join(fixture, 'src/components/aliencn/badge.tsx'),
      '// drift\n',
      'utf8'
    );
    const drift = recordedIO();
    expect(await runCli(['diff', 'badge', '--cwd', fixture], drift)).toBe(1);
    expect(drift.out.join('\n')).toContain('-// drift');

    const doctorIO = recordedIO();
    expect(await runCli(['doctor', '--cwd', fixture, '--json'], doctorIO)).toBe(0);
    const report: unknown = JSON.parse(doctorIO.out.join('\n'));
    expect(report).toMatchObject({ healthy: true });
  });

  it('reports typed errors, argument conflicts, and command metadata', async () => {
    const fixture = await initialized();

    const unknown = recordedIO();
    expect(
      await runCli(['add', 'does-not-exist', '--cwd', fixture, '--yes', '--skip-install'], unknown)
    ).toBe(1);
    expect(unknown.err.join('\n')).toContain('REGISTRY_NOT_FOUND');

    const conflicting = recordedIO();
    expect(
      await runCli(['init', '--cwd', fixture, '--typescript', '--javascript', '--yes'], conflicting)
    ).toBe(1);
    expect(conflicting.err.join('\n')).toContain('INVALID_ARGUMENT');

    const badFramework = recordedIO();
    expect(
      await runCli(['init', '--cwd', fixture, '--framework', 'angular', '--yes'], badFramework)
    ).toBe(1);

    const version = recordedIO();
    expect(await runCli(['--version'], version)).toBe(0);
    const help = recordedIO();
    expect(await runCli(['--help'], help)).toBe(0);
    expect(help.out.join('\n')).toContain('aliencn');
  });
});
