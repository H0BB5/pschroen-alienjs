# Aliencn

Aliencn is a source-first component registry for React applications that want a restrained dashboard foundation plus the expressive UI and WebGL capabilities of [Space.js](https://github.com/alienkitty/space.js) and [Alien.js](https://github.com/alienkitty/alien.js).

The CLI copies components into your project, where you can review and own them. It does not fork the upstream runtime: Space.js, Alien.js, and Three.js remain normal package dependencies and the single source of truth for their APIs and types.

## Quick start

```sh
npx aliencn init --yes
npx aliencn add button card input-field tabs
```

Import the generated stylesheet once from the location printed by `init`:

```tsx
import './aliencn.css';
```

Then import source-owned components from the detected alias:

```tsx
import { Button } from '@/components/aliencn/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/aliencn/card';

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendering pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Launch preview</Button>
      </CardContent>
    </Card>
  );
}
```

JavaScript projects receive `.js`/`.jsx` files generated from the same canonical TypeScript templates. There is no second registry implementation to drift.

## Commands

```text
aliencn init
aliencn add button card
aliencn add --all
aliencn list
aliencn diff button
aliencn doctor
```

Every project-mutating command accepts `--cwd` and `--dry-run`. Initialization and add support `--path`; add supports multiple names and `--all`, `--yes`, `--overwrite`, `--skip-install`, and install-time component options via `--set` (for example `aliencn add switch --set variant=system`), and offers an interactive picker when run with no names in a terminal.

Theming: `aliencn init --theme carbon` or `--theme paper` applies a packaged token preset, and `--theme ./your-tokens.css` bridges an existing design system; the theme lands in a sibling `aliencn-theme.css` you own.

Safety is deliberate:

- paths cannot escape the target project;
- identical files are skipped;
- customized files are preserved by default;
- `--yes` never implies overwrite;
- `--dry-run` reports the full plan without writing or installing;
- writes are atomic;
- package-manager commands do not use a shell;
- library APIs throw typed errors instead of exiting the host process.

See the [CLI reference](docs/cli.md) for every option.

## Catalog

Dashboard primitives:

- button
- card
- badge
- input-field
- tabs
- dialog
- sheet
- switch (default and system variants)
- skeleton
- empty-state
- banner

Experiential primitives:

- `panel`: SSR-safe Space.js panel host
- `magnetic`: reduced-motion-aware Space.js interaction
- `shader-canvas`: lifecycle-safe Three.js shader with Alien.js `Wobble` motion

TypeScript projects also receive interim ambient declarations for the `@alienkitty` packages (which do not ship types on npm yet); delete those files once upstream releases include declarations.

The visual hierarchy was informed by the Checkpoint dashboard component set, but the registry uses generic language, semantic CSS tokens, and no product-specific branding. See the [component catalog](docs/components.md).

## Project configuration

`aliencn init` writes a validated `aliencn.json`:

```json
{
  "$schema": "https://raw.githubusercontent.com/H0BB5/pschroen-alienjs/main/packages/cli/schema.json",
  "version": 1,
  "framework": "next",
  "language": "ts",
  "paths": {
    "components": "src/components/aliencn",
    "utils": "src/lib/aliencn",
    "styles": "src/app/aliencn.css"
  },
  "aliases": {
    "components": "@/components/aliencn",
    "utils": "@/lib/aliencn"
  }
}
```

Next.js, Vite React, generic React, TypeScript/JavaScript, npm, pnpm, Yarn, Bun, source roots, and `paths` aliases are detected. The schema is also packed as `aliencn/schema.json`.

## Development

Requires Node 20.11 or newer.

```sh
npm install
npm run check
```

### Local component catalog

The standalone Next.js app in [`examples/catalog`](examples/catalog) renders every registry component in composed Alien.js/Space.js views.

```sh
npm install
npm run example:dev
```

Open [http://localhost:3000](http://localhost:3000). Use `npm run example:sync` after changing a registry template; `npm run example:check` verifies the generated source, strict types, CLI health, and production build.

The verification suite includes:

- strict/no-implicit-any source and template gates;
- unit tests for detection, registry resolution, transforms, paths, installs, and writes;
- a strict Next TypeScript generated fixture;
- a Vite React JavaScript full-catalog bundle;
- compatibility compilation against local typed Space.js/Alien.js worktrees when present;
- built-CLI end-to-end tests;
- npm pack manifest validation;
- production-dependency audit in CI.

Read [Architecture](docs/architecture.md) for package boundaries and invariants.

## Attribution

Aliencn integrates the official `@alienkitty/space.js` and `@alienkitty/alien.js` packages. Those projects are authored by Patrick Schroen and distributed under their own MIT licenses. Aliencn does not redistribute their source runtime.

## License

MIT
