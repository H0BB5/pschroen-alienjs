import fs from 'fs-extra';
import path from 'path';

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

export async function detectPackageManager(cwd: string = process.cwd()): Promise<PackageManager> {
    if (await fs.pathExists(path.resolve(cwd, 'bun.lockb')) || await fs.pathExists(path.resolve(cwd, 'bun.lock'))) {
        return 'bun';
    }

    if (await fs.pathExists(path.resolve(cwd, 'pnpm-lock.yaml'))) {
        return 'pnpm';
    }

    if (await fs.pathExists(path.resolve(cwd, 'yarn.lock'))) {
        return 'yarn';
    }

    return 'npm';
}

export function getInstallCommand(pm: PackageManager, pkg: string): string {
    switch (pm) {
        case 'bun':
            return `bun add ${pkg}`;
        case 'pnpm':
            return `pnpm add ${pkg}`;
        case 'yarn':
            return `yarn add ${pkg}`;
        default:
            return `npm install ${pkg}`;
    }
}
