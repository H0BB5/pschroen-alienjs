import path from 'node:path';

import { AliencnError } from './errors.js';

export function normalizeProjectPath(value: string, label: string): string {
  const normalized = value.trim().replaceAll('\\', '/').replace(/^\.\//, '').replace(/\/$/, '');

  if (
    normalized.length === 0 ||
    /^[A-Za-z]:\//u.test(normalized) ||
    path.posix.isAbsolute(normalized) ||
    normalized === '..' ||
    normalized.startsWith('../') ||
    normalized.includes('/../')
  ) {
    throw new AliencnError('INVALID_ARGUMENT', `${label} must be a relative path inside the project.`, {
      value
    });
  }

  const collapsed = path.posix.normalize(normalized);
  if (collapsed === '.' || collapsed.length === 0) {
    throw new AliencnError('INVALID_ARGUMENT', `${label} must identify a location inside the project.`, {
      value
    });
  }
  return collapsed;
}

export function resolveWithinRoot(root: string, projectPath: string, label = 'Path'): string {
  const normalized = normalizeProjectPath(projectPath, label);
  const absolute = path.resolve(root, normalized);
  const relative = path.relative(root, absolute);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new AliencnError('INVALID_ARGUMENT', `${label} escapes the project root.`, {
      root,
      projectPath
    });
  }

  return absolute;
}

export function toPosix(value: string): string {
  return value.replaceAll(path.sep, '/');
}

export function relativeImport(fromFile: string, targetWithoutExtension: string): string {
  let relative = toPosix(path.relative(path.dirname(fromFile), targetWithoutExtension));
  if (!relative.startsWith('.')) {
    relative = `./${relative}`;
  }
  return relative;
}

export function stripKnownExtension(value: string): string {
  return value.replace(/\.(?:[cm]?[jt]sx?|css)$/u, '');
}
