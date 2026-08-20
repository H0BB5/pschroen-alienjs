import { readFile } from 'node:fs/promises';
import path from 'node:path';

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { packageDirectory } from '../helpers.js';

describe('type quality gates', () => {
  it('enables strict no-implicit-any checking', async () => {
    const source = await readFile(path.join(packageDirectory(), 'tsconfig.json'), 'utf8');
    const rootSource = await readFile(path.join(packageDirectory(), '..', '..', 'tsconfig.base.json'), 'utf8');
    expect(`${source}\n${rootSource}`).toMatch(/"strict"\s*:\s*true/u);
    expect(`${source}\n${rootSource}`).toMatch(/"noImplicitAny"\s*:\s*true/u);
    expect(`${source}\n${rootSource}`).toMatch(/"skipLibCheck"\s*:\s*false/u);
  });

  it('contains no explicit-any or assertion escape hatches in authored TypeScript', async () => {
    const files = await collectFiles(path.join(packageDirectory(), 'src'));
    files.push(...(await collectFiles(path.join(packageDirectory(), 'templates', 'registry'))));
    files.push(...(await collectFiles(path.join(packageDirectory(), 'test'))));
    files.push(...(await collectFiles(packageDirectory(), false)));
    const violations: string[] = [];
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      const sourceFile = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.Latest,
        true,
        file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
      );
      if (containsUnsafeType(sourceFile)) {
        violations.push(path.relative(packageDirectory(), file));
      }
    }
    expect(violations).toEqual([]);
  });

  it('uses unknown plus narrowing at dynamic import failure boundaries', async () => {
    const panel = await readFile(
      path.join(packageDirectory(), 'templates', 'registry', 'panel.tsx'),
      'utf8'
    );
    expect(panel).toContain('.catch((error: unknown)');
    expect(panel).toContain('error instanceof Error');
  });
});

function containsUnsafeType(node: ts.Node): boolean {
  if (
    node.kind === ts.SyntaxKind.AnyKeyword ||
    ts.isAsExpression(node) ||
    ts.isTypeAssertionExpression(node)
  ) {
    return true;
  }
  return node.getChildren().some(containsUnsafeType);
}

async function collectFiles(root: string, recursive = true): Promise<string[]> {
  const { readdir } = await import('node:fs/promises');
  const entries = await readdir(root, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory() && recursive) files.push(...(await collectFiles(target)));
    else if (/\.(?:ts|tsx)$/u.test(entry.name)) files.push(target);
  }
  return files;
}
