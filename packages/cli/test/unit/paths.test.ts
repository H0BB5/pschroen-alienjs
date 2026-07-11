import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { normalizeProjectPath, relativeImport, resolveWithinRoot } from '../../src/paths.js';

describe('project paths', () => {
  it('normalizes safe project paths', () => {
    expect(normalizeProjectPath('./src/components/', 'Components')).toBe('src/components');
  });

  it.each(['../outside', 'src/../../outside', '/tmp/outside', 'C:\\outside', '', 'foo/..'])(
    'rejects escaping path %s',
    (candidate) => {
      expect(() => normalizeProjectPath(candidate, 'Components')).toThrow(
        /inside the project|relative path/
      );
    }
  );

  it('resolves paths within the selected root', () => {
    const root = path.resolve('/tmp/project');
    expect(resolveWithinRoot(root, 'src/ui')).toBe(path.join(root, 'src/ui'));
  });

  it('creates portable relative imports', () => {
    expect(relativeImport('/project/src/components/a.tsx', '/project/src/lib/cn')).toBe('../lib/cn');
    expect(relativeImport('/project/src/a.tsx', '/project/src/cn')).toBe('./cn');
  });
});
