import { spawn } from 'node:child_process';

import { AliencnError } from './errors.js';
import { allDependencies } from './project.js';
import type { PackageJson, PackageManager } from './types.js';

export interface InstallCommand {
  command: string;
  args: string[];
}

export function getInstallCommand(
  manager: PackageManager,
  packages: readonly string[],
  dev = false
): InstallCommand {
  switch (manager) {
    case 'pnpm':
      return { command: 'pnpm', args: ['add', ...(dev ? ['--save-dev'] : []), ...packages] };
    case 'yarn':
      return { command: 'yarn', args: ['add', ...(dev ? ['--dev'] : []), ...packages] };
    case 'bun':
      return { command: 'bun', args: ['add', ...(dev ? ['--dev'] : []), ...packages] };
    case 'npm':
      return { command: 'npm', args: ['install', ...(dev ? ['--save-dev'] : []), ...packages] };
  }
}

export function missingPackages(
  packageJson: PackageJson,
  requested: Readonly<Record<string, string>>
): string[] {
  const installed = allDependencies(packageJson);
  return Object.entries(requested)
    .filter(([name]) => !(name in installed))
    .map(([name, version]) => `${name}@${version}`);
}

export async function installPackages(
  cwd: string,
  manager: PackageManager,
  packages: readonly string[]
): Promise<void> {
  if (packages.length === 0) return;
  const { command, args } = getInstallCommand(manager, packages);

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: false,
      env: process.env
    });
    child.once('error', (error) => {
      reject(
        new AliencnError(
          'INSTALL_FAILED',
          `Unable to start ${manager}. Re-run with --skip-install to manage dependencies yourself.`,
          { command, args },
          { cause: error }
        )
      );
    });
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new AliencnError(
          'INSTALL_FAILED',
          `${manager} exited ${signal ? `after signal ${signal}` : `with code ${code ?? 'unknown'}`}.`,
          { command, args, code, signal }
        )
      );
    });
  });
}
