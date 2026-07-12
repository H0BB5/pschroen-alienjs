import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { addComponents, initProject } from '../../src/operations.js';
import { publicRegistryItems } from '../../src/registry.js';
import { copyFixture, packageDirectory, removeFixture } from '../helpers.js';

const fixtures: string[] = [];
const localSpaceRoot = path.resolve(packageDirectory(), '..', '..', '..', 'space.js');
const localAlienRoot = path.resolve(packageDirectory(), '..', '..', '..', 'alien.js');
const hasLocalTypedUpstreams =
  existsSync(path.join(localSpaceRoot, 'types', 'src', 'index.d.ts')) &&
  existsSync(path.join(localAlienRoot, 'types', 'src', 'three.d.ts'));
afterEach(async () => {
  await Promise.all(fixtures.splice(0).map((fixture) => removeFixture(fixture)));
});

describe('generated projects', () => {
  it('strictly typechecks and builds every Next TypeScript registry template', async () => {
    const fixture = await copyFixture('next-ts');
    fixtures.push(fixture);
    await initProject({ cwd: fixture, yes: true, skipInstall: true });
    await addComponents([], { cwd: fixture, all: true, yes: true, skipInstall: true });

    const tsc = path.resolve(packageDirectory(), '..', '..', 'node_modules', 'typescript', 'bin', 'tsc');
    const result = await run(process.execPath, [tsc, '--project', 'tsconfig.json'], fixture);
    expect(result.stderr).toBe('');
    expect(result.code, result.stdout || result.stderr).toBe(0);

    const imports = publicRegistryItems()
      .map(
        (item, index) =>
          `import * as component${index} from '@/components/aliencn/${item.name}';`
      )
      .join('\n');
    const references = publicRegistryItems()
      .map((_item, index) => `component${index}`)
      .join(', ');
    await writeFile(
      path.join(fixture, 'src', 'app', 'catalog.tsx'),
      `'use client';\n${imports}\nconst modules = [${references}];\nexport function Catalog() { return <main>Aliencn modules: {modules.length}</main>; }\n`,
      'utf8'
    );
    await writeFile(
      path.join(fixture, 'src', 'app', 'page.tsx'),
      "import { Catalog } from './catalog';\nexport default function Page() { return <Catalog />; }\n",
      'utf8'
    );
    await writeFile(
      path.join(fixture, 'src', 'app', 'layout.tsx'),
      "import type { ReactNode } from 'react';\nimport './aliencn.css';\nexport default function Layout({ children }: { children: ReactNode }) { return <html lang=\"en\"><body>{children}</body></html>; }\n",
      'utf8'
    );
    const next = path.resolve(
      packageDirectory(),
      '..',
      '..',
      'node_modules',
      'next',
      'dist',
      'bin',
      'next'
    );
    const built = await run(process.execPath, [next, 'build'], fixture);
    expect(built.code, `${built.stdout}\n${built.stderr}`.trim()).toBe(0);
  });

  it('transpiles and bundles every Vite React JavaScript registry template', async () => {
    const fixture = await copyFixture('vite-js');
    fixtures.push(fixture);
    await initProject({ cwd: fixture, yes: true, skipInstall: true });
    await addComponents([], { cwd: fixture, all: true, yes: true, skipInstall: true });

    const imports = publicRegistryItems()
      .map(
        (item, index) =>
          `import * as component${index} from './components/aliencn/${item.name}.jsx';`
      )
      .join('\n');
    const references = publicRegistryItems()
      .map((_item, index) => `component${index}`)
      .join(', ');
    await writeFile(
      path.join(fixture, 'src', 'main.jsx'),
      `import './styles/aliencn.css';\n${imports}\nconsole.log([${references}].length);\n`,
      'utf8'
    );

    for (const item of publicRegistryItems()) {
      const source = await readFile(
        path.join(fixture, 'src', 'components', 'aliencn', `${item.name}.jsx`),
        'utf8'
      );
      expect(source).not.toMatch(/\binterface\s+[A-Z]|\btype\s+[A-Z][A-Za-z]+\s*=/u);
    }

    const vite = path.resolve(packageDirectory(), '..', '..', 'node_modules', 'vite', 'bin', 'vite.js');
    const result = await run(process.execPath, [vite, 'build'], fixture);
    expect(result.code).toBe(0);
    expect(result.stderr).not.toMatch(/build failed/iu);
  });
});

describe.runIf(hasLocalTypedUpstreams)('local typed upstream compatibility', () => {
  it('compiles experiential templates against the actual Space.js and Alien.js declarations', async () => {
    const fixture = await copyFixture('next-ts');
    fixtures.push(fixture);
    await initProject({ cwd: fixture, yes: true, skipInstall: true });
    await addComponents(['panel', 'magnetic', 'shader-canvas'], {
      cwd: fixture,
      yes: true,
      skipInstall: true
    });
    // Simulate the post-upstream world: once the real packages ship types,
    // consumers delete the interim ambient shims so they cannot shadow them.
    await rm(path.join(fixture, 'src', 'components', 'aliencn', 'space-types.d.ts'));
    await rm(path.join(fixture, 'src', 'components', 'aliencn', 'alien-types.d.ts'));

    const config = {
      compilerOptions: {
        target: 'ES2022',
        lib: ['DOM', 'DOM.Iterable', 'ES2022'],
        module: 'ESNext',
        moduleResolution: 'Bundler',
        jsx: 'preserve',
        strict: true,
        noImplicitAny: true,
        noUncheckedIndexedAccess: true,
        exactOptionalPropertyTypes: true,
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*'],
          '@alienkitty/space.js': [path.join(localSpaceRoot, 'types/src/index.d.ts')],
          '@alienkitty/alien.js/three': [path.join(localAlienRoot, 'types/src/three.d.ts')]
        },
        skipLibCheck: false,
        noEmit: true
      },
      include: ['src']
    };
    await writeFile(
      path.join(fixture, 'tsconfig.local.json'),
      `${JSON.stringify(config, null, 2)}\n`,
      'utf8'
    );

    const tsc = path.resolve(packageDirectory(), '..', '..', 'node_modules', 'typescript', 'bin', 'tsc');
    const result = await run(process.execPath, [tsc, '--project', 'tsconfig.local.json'], fixture);
    expect(result.code, result.stdout || result.stderr).toBe(0);
  });
});

interface ProcessResult {
  code: number;
  stdout: string;
  stderr: string;
}

async function run(command: string, args: readonly string[], cwd: string): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, [...args], {
      cwd,
      shell: false,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }
    });
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
