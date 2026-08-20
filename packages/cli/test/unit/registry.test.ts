import { describe, expect, it } from 'vitest';

import {
  applicableItems,
  collectPackageDependencies,
  publicRegistryItems,
  resolveRegistryItems
} from '../../src/registry.js';

describe('registry graph', () => {
  it('resolves foundations before requested components and deduplicates them', () => {
    const items = resolveRegistryItems(['button', 'card']);
    expect(items.map((item) => item.name)).toEqual(['styles', 'cn', 'button', 'card']);
  });

  it('includes the curated dashboard and experience catalog', () => {
    expect(publicRegistryItems().map((item) => item.name)).toEqual(
      expect.arrayContaining([
        'button',
        'card',
        'badge',
        'input-field',
        'tabs',
        'dialog',
        'sheet',
        'switch',
        'skeleton',
        'empty-state',
        'banner',
        'tooltip',
        'toast',
        'select',
        'label',
        'separator',
        'textarea',
        'checkbox',
        'alert-dialog',
        'table',
        'progress',
        'scroll-director',
        'decode-text',
        'ticker',
        'section-rail',
        'panel',
        'magnetic',
        'shader-canvas',
        'motion',
        'motion-react'
      ])
    );
  });

  it('resolves the motion family with its type shims before the wrapper', () => {
    const items = resolveRegistryItems(['motion-react']);
    expect(items.map((item) => item.name)).toEqual(['motion-types', 'motion', 'motion-react']);
    expect(collectPackageDependencies(items)).toEqual({});
  });

  it('marks every vendored motion module verbatim and keeps the shims non-verbatim', () => {
    const motion = resolveRegistryItems(['motion']).find((item) => item.name === 'motion');
    expect(motion?.files.length).toBe(5);
    expect(motion?.files.every((file) => file.verbatim === true)).toBe(true);
    const shims = resolveRegistryItems(['motion']).find((item) => item.name === 'motion-types');
    expect(shims?.files.length).toBe(5);
    expect(shims?.files.every((file) => file.verbatim !== true)).toBe(true);
  });

  it('collects official upstream dependencies without a copied runtime', () => {
    const dependencies = collectPackageDependencies(
      resolveRegistryItems(['panel', 'shader-canvas'])
    );
    expect(dependencies).toEqual({
      '@alienkitty/space.js': '^1.2.0',
      '@alienkitty/alien.js': '^1.2.0',
      '@types/three': '^0.185.1',
      three: '^0.185.1'
    });
    expect(Object.keys(dependencies).some((name) => name.startsWith('@hobbs/'))).toBe(false);
  });

  it('drops TypeScript-only shim items and their dependencies for JavaScript projects', () => {
    const resolved = resolveRegistryItems(['panel', 'shader-canvas']);
    const forJs = applicableItems(resolved, 'js');
    expect(forJs.map((item) => item.name)).not.toContain('space-types');
    expect(forJs.map((item) => item.name)).not.toContain('alien-types');
    expect(collectPackageDependencies(forJs)).toEqual({
      '@alienkitty/space.js': '^1.2.0',
      '@alienkitty/alien.js': '^1.2.0',
      three: '^0.185.1'
    });
    expect(applicableItems(resolved, 'ts')).toEqual(resolved);
  });

  it('reports unknown components with available choices', () => {
    expect(() => resolveRegistryItems(['missing'])).toThrow(/Unknown component/);
  });
});
