import { describe, expect, it } from 'vitest';

import {
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
        'switch',
        'skeleton',
        'empty-state',
        'banner',
        'panel',
        'magnetic',
        'shader-canvas'
      ])
    );
  });

  it('collects official upstream dependencies without a copied runtime', () => {
    const dependencies = collectPackageDependencies(
      resolveRegistryItems(['panel', 'shader-canvas'])
    );
    expect(dependencies).toEqual({
      '@alienkitty/space.js': '^1.2.0',
      '@alienkitty/alien.js': '^1.2.0',
      three: '^0.185.1'
    });
    expect(Object.keys(dependencies).some((name) => name.startsWith('@hobbs/'))).toBe(false);
  });

  it('reports unknown components with available choices', () => {
    expect(() => resolveRegistryItems(['missing'])).toThrow(/Unknown component/);
  });
});
