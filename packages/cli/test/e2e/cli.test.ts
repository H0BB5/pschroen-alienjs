import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { copyFixture, packageDirectory, removeFixture } from '../helpers.js';

const fixtures: string[] = [];
afterEach(async () => {
  await Promise.all(fixtures.splice(0).map((fixture) => removeFixture(fixture)));
});

describe('built CLI', () => {
  it('runs init, multi-add, list, diff, and doctor as a user would', async () => {
    const fixture = await copyFixture('vite-js');
    fixtures.push(fixture);
    const cli = path.join(packageDirectory(), 'dist', 'bin.js');

    expect((await run(cli, ['init', '--cwd', fixture, '--yes', '--skip-install'])).code).toBe(0);
    expect(
      (
        await run(cli, [
          'add',
          'button',
          'magnetic',
          '--cwd',
          fixture,
          '--yes',
          '--skip-install'
        ])
      ).code
    ).toBe(0);
    await expect(
      access(path.join(fixture, 'src', 'components', 'aliencn', 'button.jsx'))
    ).resolves.toBeUndefined();

    const list = await run(cli, ['list', '--cwd', fixture, '--json']);
    expect(list.code).toBe(0);
    const listed: unknown = JSON.parse(list.stdout);
    expect(Array.isArray(listed)).toBe(true);

    expect((await run(cli, ['diff', 'button', '--cwd', fixture])).code).toBe(0);
    const report = await run(cli, ['doctor', '--cwd', fixture, '--json']);
    expect(report.code).toBe(0);
    expect(report.stdout).toContain('"healthy": true');
  });

  it('returns typed failures without terminating library callers', async () => {
    const fixture = await copyFixture('vite-js');
    fixtures.push(fixture);
    const cli = path.join(packageDirectory(), 'dist', 'bin.js');
    const result = await run(cli, ['add', 'missing', '--cwd', fixture, '--yes', '--skip-install']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('CONFIG_MISSING');
  });
});

interface ProcessResult {
  code: number;
  stdout: string;
  stderr: string;
}

async function run(cli: string, args: readonly string[]): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, ...args], { shell: false });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });
    child.once('error', reject);
    child.once('exit', (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}
