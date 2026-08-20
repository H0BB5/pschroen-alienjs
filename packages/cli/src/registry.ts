import { AliencnError } from './errors.js';
import type { Language, RegistryItem } from './types.js';

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
  },
  {
    name: 'space-types',
    title: 'Space.js ambient types',
    description:
      'Interim ambient declarations for @alienkitty/space.js until the published package ships its own.',
    category: 'foundation',
    hidden: true,
    languages: ['ts'],
    files: [{ source: 'space-types.d.ts', target: 'space-types.d.ts', location: 'components' }],
    registryDependencies: [],
    dependencies: {}
  },
  {
    name: 'alien-types',
    title: 'Alien.js ambient types',
    description:
      'Interim ambient declarations for @alienkitty/alien.js plus the @types/three package it builds on.',
    category: 'foundation',
    hidden: true,
    languages: ['ts'],
    files: [{ source: 'alien-types.d.ts', target: 'alien-types.d.ts', location: 'components' }],
    registryDependencies: [],
    dependencies: { '@types/three': '^0.185.1' }
  }
];

const dashboard: readonly RegistryItem[] = [
  dashboardItem('button', 'Button', 'Accessible buttons with loading, tone, and size states.'),
  dashboardItem('card', 'Card', 'Composable dashboard surface, header, content, and footer.'),
  dashboardItem('badge', 'Badge', 'Compact semantic status and presence indicator.'),
  dashboardItem('input-field', 'Input field', 'Labeled input with hint, error, and ARIA wiring.'),
  dashboardItem('tabs', 'Tabs', 'Keyboard-navigable tabs with controlled and uncontrolled modes.'),
  dashboardItem('dialog', 'Dialog', 'Native modal dialog with managed open state and accessible labels.'),
  dashboardItem(
    'sheet',
    'Sheet',
    'Edge-docked configuration surface with sections, rows, and a save-bar footer.'
  ),
  {
    name: 'switch',
    title: 'Switch',
    description:
      'Controlled boolean switch in default (settings toggle) and system (instrument) variants.',
    category: 'dashboard',
    files: [{ source: 'switch.tsx', target: 'switch.tsx', location: 'components' }],
    registryDependencies: ['styles', 'cn'],
    dependencies: {},
    options: [{ name: 'variant', values: ['default', 'system'], default: 'default' }]
  },
  dashboardItem('tooltip', 'Tooltip', 'Hover and focus tooltip with viewport-aware flipping and Escape dismissal.'),
  dashboardItem('toast', 'Toast', 'Queued notifications with tones, live regions, and hover-paused timers.'),
  dashboardItem('select', 'Select', 'Styled native select with platform keyboard, form, and mobile behavior.'),
  dashboardItem('label', 'Label', 'The registration-mark form label used across field components.'),
  dashboardItem('separator', 'Separator', 'Hairline or dashed rule in both orientations.'),
  dashboardItem('textarea', 'Textarea', 'Multi-line input sharing the Input optics.'),
  dashboardItem('checkbox', 'Checkbox', 'Native checkbox with the square instrument treatment.'),
  {
    name: 'alert-dialog',
    title: 'Alert dialog',
    description: 'Destructive-confirm preset over the native dialog with focus on Cancel.',
    category: 'dashboard',
    files: [{ source: 'alert-dialog.tsx', target: 'alert-dialog.tsx', location: 'components' }],
    registryDependencies: ['styles', 'cn', 'dialog', 'button'],
    dependencies: {}
  },
  dashboardItem('table', 'Table', 'Styled semantic table with an owned horizontal scroll frame.'),
  dashboardItem('progress', 'Progress', 'Styled native progress with an indeterminate scan state.'),
  dashboardItem('skeleton', 'Skeleton', 'Reduced-motion-aware loading placeholder.'),
  dashboardItem('empty-state', 'Empty state', 'Centered empty-state composition with one primary action.'),
  dashboardItem('banner', 'Banner', 'Persistent information, success, warning, and danger notice.')
];

const experience: readonly RegistryItem[] = [
  {
    name: 'scroll-director',
    title: 'Scroll director',
    description:
      'Space.js SmoothSkew-style kinetic scroll response on native scrolling, plus modal scroll lock and anchor glides.',
    category: 'experience',
    files: [{ source: 'scroll-director.tsx', target: 'scroll-director.tsx', location: 'components' }],
    registryDependencies: ['styles'],
    dependencies: {}
  },
  {
    name: 'decode-text',
    title: 'Decode text',
    description: 'Text that scrambles into place on first view; screen readers always get the real text.',
    category: 'experience',
    files: [{ source: 'decode-text.tsx', target: 'decode-text.tsx', location: 'components' }],
    registryDependencies: ['styles', 'cn'],
    dependencies: {}
  },
  {
    name: 'ticker',
    title: 'Ticker',
    description: 'Seamless hairline status stream that pauses on hover and rests under reduced motion.',
    category: 'experience',
    files: [{ source: 'ticker.tsx', target: 'ticker.tsx', location: 'components' }],
    registryDependencies: ['styles', 'cn'],
    dependencies: {}
  },
  {
    name: 'section-rail',
    title: 'Section rail',
    description: 'Fixed section-progress ticks in difference blend, tracking the section nearest center.',
    category: 'experience',
    files: [{ source: 'section-rail.tsx', target: 'section-rail.tsx', location: 'components' }],
    registryDependencies: ['styles', 'cn'],
    dependencies: {}
  },
  {
    name: 'panel',
    title: 'Space panel',
    description: 'SSR-safe React host for Space.js panel items with deterministic cleanup.',
    category: 'experience',
    files: [{ source: 'panel.tsx', target: 'panel.tsx', location: 'components' }],
    registryDependencies: ['styles', 'cn', 'space-types'],
    dependencies: { '@alienkitty/space.js': '^1.2.0' }
  },
  {
    name: 'magnetic',
    title: 'Magnetic interaction',
    description: 'Progressively enhanced Space.js magnetic motion with reduced-motion fallback.',
    category: 'experience',
    files: [{ source: 'magnetic.tsx', target: 'magnetic.tsx', location: 'components' }],
    registryDependencies: ['styles', 'cn', 'space-types'],
    dependencies: { '@alienkitty/space.js': '^1.2.0' }
  },
  {
    name: 'shader-canvas',
    title: 'Shader canvas',
    description: 'Responsive Alien.js and Three.js shader canvas with lifecycle-safe WebGL cleanup.',
    category: 'experience',
    files: [{ source: 'shader-canvas.tsx', target: 'shader-canvas.tsx', location: 'components' }],
    registryDependencies: ['styles', 'cn', 'alien-types'],
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

export function applicableItems(
  items: readonly RegistryItem[],
  language: Language
): RegistryItem[] {
  return items.filter((item) => !item.languages || item.languages.includes(language));
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
