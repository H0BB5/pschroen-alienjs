# alien-cn

POC for a shadcn-style CLI that installs [space.js](https://github.com/alienkitty/space.js) UI components into Next.js projects. Instead of importing from a package, components get copied as source files that you own and can modify.

Currently only the Panel component family is implemented.

## What the DX looks like

> **Note:** Packages aren't published to npm. To try locally, clone the repo, build, and link:
>
> ```sh
> cd packages/core && npm link && cd ../cli && npx tsup && npm link
> ```
>
> Then in your Next.js project:
>
> ```sh
> npm link @hobbs/alien-core @hobbs/alien-cli
> ```

**1. Init a project** (`npx @hobbs/alien-cli init` if published)

```sh
alien init
```

Creates an `alien.config.json` and installs `@hobbs/alien-core` (lightweight runtime with Interface, tween, EventEmitter, Stage, etc).

**2. Add a component**

```sh
alien add panel
```

This copies the full Panel component tree into your project — Panel, PanelItem, Slider, Toggle, List, ColorPicker, PanelGraph, PanelMeter, and all sub-components. TypeScript or JavaScript, based on your project config.

It also drops in `alien-ui.css` with all the CSS custom properties for theming.

**3. Use it**

```tsx
"use client";

import { usePanel } from "@/components/alien-ui/panels/usePanel";

export default function Home() {
  const containerRef = usePanel([
    { type: "slider", name: "Speed", min: 0, max: 10, step: 0.1, value: 1 },
    { type: "toggle", name: "Debug", value: false },
    { type: "color", name: "Tint", value: "#ff0000" },
    { type: "divider" },
    { type: "graph", name: "FPS", noText: true },
  ]);

  return <div ref={containerRef} />;
}
```

The panel renders with the full space.js look and behavior — tweens, easing, the CSS variable theming system, all of it.

**4. Customize**

Everything is in your project as source. Override CSS variables for theming:

```css
:root {
  --ui-panel-width: 150px;
  --ui-color: #0ff;
  --ui-panel-item-height: 24px;
  --ui-toggle-inactive-opacity: 0.25;
}
```

Or modify the component files directly, they're yours.

## Architecture

Monorepo with two packages:

- **`packages/core`** — Minimal runtime: Interface (DOM wrapper + tween), EventEmitter, ticker, Stage, Vector2, Color, easing functions. This is the only install dependency.
- **`packages/cli`** — The `add`/`init` commands and all component templates (TS + JS variants).
