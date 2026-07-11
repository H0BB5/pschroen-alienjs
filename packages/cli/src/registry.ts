import { AliencnError } from './errors.js';
import type { RegistryItem } from './types.js';

const foundation: readonly RegistryItem[] = [
  {
    name: 'styles',
    title: 'Semantic styles',
    description: 'Theme tokens, component styles, Space.js variables, focus states, and reduced motion.',
    category: 'foundation',
    hidden: true,
    files: [
      {
        source: 'aliencn.css',
        target: 'aliencn.css',
        location: 'styles',
        preserve: true
      }
    ],
    registryDependencies: [],
    dependencies: {}
  },
  {
    name: 'cn',
    title: 'Class name utility',
    description: 'A tiny dependency-free class name combiner.',
    category: 'foundation',
    hidden: true,
    files: [{ source: 'cn.ts', target: 'cn.ts', location: 'utils' }],
    registryDependencies: [],
    dependencies: {}
  }
];

const dashboard: readonly RegistryItem[] = [
  dashboardItem('button', 'Button', 'Accessible buttons with loading, tone, and size states.'),
  dashboardItem('card', 'Card', 'Composable dashboard surface, header, content, and footer.'),
  dashboardItem('badge', 'Badge', 'Compact semantic status and presence indicator.'),
  dashboardItem('input-field', 'Input field', 'Labeled input with hint, error, and ARIA wiring.'),
  dashboardItem('tabs', 'Tabs', 'Keyboard-navigable tabs with controlled and uncontrolled modes.'),
  dashboardItem('dialog', 'Dialog', 'Native modal dialog with managed open state and accessible labels.'),
  dashboardItem('switch', 'Switch', 'Controlled accessible boolean switch with optional visible label.'),
  dashboardItem('skeleton', 'Skeleton', 'Reduced-motion-aware loading placeholder.'),
  dashboardItem('empty-state', 'Empty state', 'Centered empty-state composition with one primary action.'),
  dashboardItem('banner', 'Banner', 'Persistent information, success, warning, and danger notice.')
];

const experience: readonly RegistryItem[] = [
  {
    name: 'panel',
    title: 'Space panel',
    description: 'SSR-safe React host for Space.js panel items with deterministic cleanup.',
    category: 'experience',
    files: [{ source: 'panel.tsx', target: 'panel.tsx', location: 'components' }],
    registryDependencies: ['styles', 'cn'],
    dependencies: { '@alienkitty/space.js': '^1.2.0' }
  },
  {
    name: 'magnetic',
    title: 'Magnetic interaction',
    description: 'Progressively enhanced Space.js magnetic motion with reduced-motion fallback.',
    category: 'experience',
    files: [{ source: 'magnetic.tsx', target: 'magnetic.tsx', location: 'components' }],
    registryDependencies: ['styles', 'cn'],
    dependencies: { '@alienkitty/space.js': '^1.2.0' }
  },
  {
    name: 'shader-canvas',
    title: 'Shader canvas',
    description: 'Responsive Alien.js and Three.js shader canvas with lifecycle-safe WebGL cleanup.',
    category: 'experience',
    files: [{ source: 'shader-canvas.tsx', target: 'shader-canvas.tsx', location: 'components' }],
    registryDependencies: ['styles', 'cn'],
    dependencies: {
      '@alienkitty/alien.js': '^1.2.0',
      three: '^0.185.1'
    }
  }
];

export const registry: readonly RegistryItem[] = [...foundation, ...dashboard, ...experience];
const registryByName = new Map(registry.map((item) => [item.name, item]));

export function getRegistryItem(name: string): RegistryItem {
  const item = registryByName.get(name);
  if (!item) {
    throw new AliencnError('REGISTRY_NOT_FOUND', `Unknown component "${name}".`, {
      available: publicRegistryItems().map((entry) => entry.name)
    });
  }
  return item;
}

export function publicRegistryItems(): RegistryItem[] {
  return registry.filter((item) => !item.hidden);
}

export function resolveRegistryItems(requested: readonly string[], all = false): RegistryItem[] {
  const names = all ? publicRegistryItems().map((item) => item.name) : [...requested];
  if (names.length === 0) {
    throw new AliencnError(
      'INVALID_ARGUMENT',
      'Choose at least one component or pass --all.'
    );
  }

  const resolved: RegistryItem[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (name: string): void => {
    if (visited.has(name)) return;
    if (visiting.has(name)) {
      throw new AliencnError('DEPENDENCY_CYCLE', `Registry dependency cycle includes "${name}".`);
    }
    visiting.add(name);
    const item = getRegistryItem(name);
    for (const dependency of item.registryDependencies) visit(dependency);
    visiting.delete(name);
    visited.add(name);
    resolved.push(item);
  };

  for (const name of names) visit(name);
  return resolved;
}

export function collectPackageDependencies(
  items: readonly RegistryItem[]
): Readonly<Record<string, string>> {
  const dependencies: Record<string, string> = {};
  for (const item of items) {
    Object.assign(dependencies, item.dependencies);
  }
  return dependencies;
}

function dashboardItem(name: string, title: string, description: string): RegistryItem {
  return {
    name,
    title,
    description,
    category: 'dashboard',
    files: [{ source: `${name}.tsx`, target: `${name}.tsx`, location: 'components' }],
    registryDependencies: ['styles', 'cn'],
    dependencies: {}
  };
}
