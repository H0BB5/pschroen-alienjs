import { execFileSync } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'aliencn-pack-'));

try {
  const output = execFileSync(
    'npm',
    ['pack', '--json', '--pack-destination', temporaryRoot],
    { cwd: packageRoot, encoding: 'utf8' }
  );
  const parsed = JSON.parse(output);
  if (!Array.isArray(parsed) || parsed.length !== 1 || !Array.isArray(parsed[0]?.files)) {
    throw new Error('npm pack returned an unexpected manifest.');
  }

  const manifest = parsed[0];
  const paths = new Set(manifest.files.map((file) => file.path));
  const required = [
    'LICENSE',
    'README.md',
    'dist/bin.js',
    'dist/index.d.ts',
    'dist/index.js',
    'package.json',
    'schema.json',
    'templates/registry/aliencn.css',
    'templates/registry/alien-types.d.ts',
    'templates/registry/button.tsx',
    'templates/registry/panel.tsx',
    'templates/registry/shader-canvas.tsx',
    'templates/registry/scroll-director.tsx',
    'templates/registry/sheet.tsx',
    'templates/registry/motion/README.md',
    'templates/registry/motion/UIUtils.js',
    'templates/registry/motion/UIUtils.d.ts',
    'templates/registry/motion/Title.js',
    'templates/registry/motion/Title.d.ts',
    'templates/registry/motion/GlitchText.js',
    'templates/registry/motion/GlitchText.d.ts',
    'templates/registry/motion/SmoothScroll.js',
    'templates/registry/motion/SmoothScroll.d.ts',
    'templates/registry/motion/PageTransition.js',
    'templates/registry/motion/PageTransition.d.ts',
    'templates/registry/motion-react.tsx',
    'templates/registry/space-types.d.ts',
    'templates/registry/ticker.tsx',
    'templates/registry/toast.tsx',
    'templates/registry/tooltip.tsx',
    'templates/themes/carbon.css',
    'templates/themes/kya-os.css',
    'templates/themes/paper.css'
  ];
  const missing = required.filter((file) => !paths.has(file));
  if (missing.length > 0) {
    throw new Error(`Package is missing required files: ${missing.join(', ')}`);
  }
  if ([...paths].some((file) => file.includes('packages/core') || file.includes('@hobbs'))) {
    throw new Error('The deprecated copied runtime leaked into the package.');
  }

  const archive = path.join(temporaryRoot, manifest.filename);
  const consumer = path.join(temporaryRoot, 'consumer');
  const project = path.join(consumer, 'project');
  await mkdir(project, { recursive: true });
  await writeFile(
    path.join(consumer, 'package.json'),
    `${JSON.stringify({ name: 'aliencn-pack-consumer', private: true }, null, 2)}\n`,
    'utf8'
  );
  execFileSync(
    'npm',
    ['install', '--ignore-scripts', '--no-audit', '--no-fund', archive],
    { cwd: consumer, stdio: 'pipe' }
  );

  const installedRoot = path.join(consumer, 'node_modules', '@kya-os', 'aliencn');
  const installedSchema = JSON.parse(
    await readFile(path.join(installedRoot, 'schema.json'), 'utf8')
  );
  if (installedSchema.title !== 'Aliencn configuration') {
    throw new Error('The packed schema.json did not parse into the expected schema.');
  }
  const installedBin = path.join(installedRoot, 'dist', 'bin.js');
  const version = execFileSync(process.execPath, [installedBin, '--version'], {
    cwd: consumer,
    encoding: 'utf8'
  }).trim();
  if (version !== manifest.version) {
    throw new Error(`Packaged CLI version ${version} does not match ${manifest.version}.`);
  }

  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "const api = await import('@kya-os/aliencn'); if (typeof api.addComponents !== 'function' || typeof api.AliencnError !== 'function') throw new Error('library exports missing');"
    ],
    { cwd: consumer, stdio: 'pipe' }
  );

  await writeFile(
    path.join(project, 'package.json'),
    `${JSON.stringify(
      {
        name: 'aliencn-packed-fixture',
        private: true,
        packageManager: 'npm@11.8.0',
        dependencies: { react: '^19.1.0', vite: '^7.0.0' }
      },
      null,
      2
    )}\n`,
    'utf8'
  );
  await mkdir(path.join(project, 'src'), { recursive: true });
  execFileSync(
    process.execPath,
    [installedBin, 'init', '--cwd', project, '--yes', '--skip-install'],
    { cwd: consumer, stdio: 'pipe' }
  );
  execFileSync(
    process.execPath,
    [installedBin, 'add', 'button', '--cwd', project, '--yes', '--skip-install'],
    { cwd: consumer, stdio: 'pipe' }
  );

  const buttonPath = path.join(project, 'src', 'components', 'aliencn', 'button.jsx');
  await access(buttonPath);
  const button = await readFile(buttonPath, 'utf8');
  if (!button.includes('aliencn-button') || button.includes('interface ButtonProps')) {
    throw new Error('Installed tarball failed to resolve and transform registry templates.');
  }

  execFileSync(
    process.execPath,
    [installedBin, 'add', 'motion', '--cwd', project, '--yes', '--skip-install'],
    { cwd: consumer, stdio: 'pipe' }
  );
  for (const module of ['UIUtils', 'Title', 'GlitchText', 'SmoothScroll', 'PageTransition']) {
    const installed = await readFile(
      path.join(project, 'src', 'components', 'aliencn', 'motion', `${module}.js`),
      'utf8'
    );
    const template = await readFile(
      path.join(installedRoot, 'templates', 'registry', 'motion', `${module}.js`),
      'utf8'
    );
    if (installed !== template) {
      throw new Error(`Verbatim motion module ${module}.js drifted from its packed template.`);
    }
  }

  console.log(
    `Validated @kya-os/aliencn@${manifest.version}: ${paths.size} files, real tarball install, binary, library, and registry.`
  );
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
