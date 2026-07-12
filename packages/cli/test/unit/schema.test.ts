import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { readConfig } from '../../src/config.js';
import { packageDirectory } from '../helpers.js';

const created: string[] = [];
afterEach(async () => {
  await Promise.all(created.splice(0).map((target) => rm(target, { recursive: true, force: true })));
});

describe('configuration schema artifact', () => {
  it('ships schema.json as parseable JSON', async () => {
    const source = await readFile(path.join(packageDirectory(), 'schema.json'), 'utf8');
    const schema: unknown = JSON.parse(source);
    expect(schema).toMatchObject({ title: 'Aliencn configuration' });
  });

  it('accepts a hand-authored config without $schema', async () => {
    const temporaryRoot = path.join(packageDirectory(), '.test-tmp');
    await mkdir(temporaryRoot, { recursive: true });
    const root = await mkdtemp(path.join(temporaryRoot, 'schema-'));
    created.push(root);
    await writeFile(
      path.join(root, 'aliencn.json'),
      JSON.stringify({
        version: 1,
        framework: 'vite',
        language: 'ts',
        paths: {
          components: 'src/components/aliencn',
          utils: 'src/lib/aliencn',
          styles: 'src/styles/aliencn.css'
        },
        aliases: { components: null, utils: null }
      }),
      'utf8'
    );
    const config = await readConfig(root);
    expect(config?.framework).toBe('vite');
  });
});
