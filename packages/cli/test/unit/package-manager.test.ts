import { describe, expect, it } from 'vitest';

import { getInstallCommand, missingPackages } from '../../src/package-manager.js';
import type { PackageManager } from '../../src/types.js';

const managerCases: Array<{
  manager: PackageManager;
  command: string;
  args: string[];
}> = [
  { manager: 'npm', command: 'npm', args: ['install', 'one@^1.0.0'] },
  { manager: 'pnpm', command: 'pnpm', args: ['add', 'one@^1.0.0'] },
  { manager: 'yarn', command: 'yarn', args: ['add', 'one@^1.0.0'] },
  { manager: 'bun', command: 'bun', args: ['add', 'one@^1.0.0'] }
];

describe('package manager commands', () => {
  it.each(managerCases)('builds a safe $manager command', ({ manager, command, args }) => {
    expect(getInstallCommand(manager, ['one@^1.0.0'])).toEqual({ command, args });
  });

  it('only installs packages absent from every dependency section', () => {
    expect(
      missingPackages(
        {
          dependencies: { one: '^1' },
          devDependencies: { two: '^2' },
          peerDependencies: { three: '^3' }
        },
        { one: '^1', two: '^2', three: '^3', four: '^4' }
      )
    ).toEqual(['four@^4']);
  });
});
