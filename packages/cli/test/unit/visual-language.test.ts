import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { packageDirectory } from '../helpers.js';

describe('Alien and Space visual language', () => {
  it('keeps the foundation dark, geometric, and free of the retired SaaS palette', async () => {
    const css = await readFile(
      path.join(packageDirectory(), 'templates', 'registry', 'aliencn.css'),
      'utf8'
    );

    expect(css).toContain('--aliencn-canvas: #060707');
    expect(css).toContain('--aliencn-radius-lg: 0');
    expect(css).toContain('--aliencn-grid-size: 1.5rem');
    expect(css).toMatch(/:root,\s*\[data-aliencn-theme="dark"\]/);
    expect(css).toContain('[data-aliencn-theme="light"]');
    expect(css).toContain(':root[data-aliencn-space]');
    expect(css).toContain(':root[data-aliencn-space][data-aliencn-theme="light"]');
    expect(css).toContain(':where([class^="aliencn-"]');
    expect(css).toContain('linear-gradient(var(--aliencn-accent), var(--aliencn-accent))');
    expect(css).toContain('@keyframes aliencn-signal');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('.aliencn-input::placeholder { color: var(--aliencn-text-muted); }');
    expect(css).not.toContain('#9887ff');
    expect(css).not.toContain('border-radius: 999px');

    const defaultFoundation = css.split(':root[data-aliencn-space]')[0] ?? '';
    expect(defaultFoundation).not.toContain('--ui-');
    expect(defaultFoundation).not.toContain('--bg-color');
  });

  it('keeps static badges out of live regions by default', async () => {
    const badge = await readFile(
      path.join(packageDirectory(), 'templates', 'registry', 'badge.tsx'),
      'utf8'
    );

    expect(badge).not.toContain('role="status"');
  });

  it('requires an explicit root opt-in for the Space.js panel surface', async () => {
    const panel = await readFile(
      path.join(packageDirectory(), 'templates', 'registry', 'panel.tsx'),
      'utf8'
    );

    expect(panel).toContain("hasAttribute('data-aliencn-space')");
    expect(panel).not.toContain('invert:');
  });

  it('uses an asymmetric fluid shader instead of concentric demo rings', async () => {
    const shader = await readFile(
      path.join(packageDirectory(), 'templates', 'registry', 'shader-canvas.tsx'),
      'utf8'
    );

    expect(shader).toContain('float fbm(vec2 p)');
    expect(shader).toContain('vec2 warp');
    expect(shader).toContain('uResolution');
    expect(shader).not.toContain('radius * 22.0');
  });
});
