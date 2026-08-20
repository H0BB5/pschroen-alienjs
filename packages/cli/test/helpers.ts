import { cp, mkdir, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const packageRoot = path.resolve(import.meta.dirname, '..');

export async function copyFixture(name: 'next-ts' | 'vite-js'): Promise<string> {
  const temporaryRoot = path.join(packageRoot, '.test-tmp');
  await mkdir(temporaryRoot, { recursive: true });
  const target = await mkdtemp(path.join(temporaryRoot, `${name}-`));
  await cp(path.join(packageRoot, 'test', 'fixtures', name), target, { recursive: true });
  return target;
}

export async function removeFixture(target: string): Promise<void> {
  const relative = path.relative(path.join(packageRoot, '.test-tmp'), target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to remove non-fixture path: ${target}`);
  }
  await rm(target, { recursive: true, force: true });
}

export function packageDirectory(): string {
  return packageRoot;
}

export function systemTemporaryDirectory(): string {
  return os.tmpdir();
}
