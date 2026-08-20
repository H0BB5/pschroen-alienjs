# Architecture

Aliencn is a source-first registry. It copies small, reviewable components into an application and leaves ownership with that application. Runtime behavior from Space.js and Alien.js remains in the official upstream packages.

## Package boundary

The publishable package is `packages/cli` and is released as `@kya-os/aliencn`. Both the `aliencn` binary and the compatibility alias `alien` point to `dist/bin.js`. `dist/index.js` exposes the same operations as a library without terminating the host process.

The previous `@hobbs/alien-core` fork was intentionally removed. Maintaining a second implementation of `Interface`, tweening, math, and events created drift and obscured upstream authorship. Registry components now declare `@alienkitty/space.js`, `@alienkitty/alien.js`, and `three` only where they are needed.

## Data flow

1. Project detection reads `package.json`, lockfiles, and editor configuration.
2. `aliencn.json` records framework, language, safe project-relative paths, and optional aliases.
3. Registry resolution performs a topological walk over registry dependencies.
4. One canonical TS/TSX template is rendered with project imports.
5. JavaScript projects receive a TypeScript `transpileModule` transform of that same source.
   Files declared `verbatim` (the vendored motion family) skip every transform and are copied byte-for-byte in both languages.
6. A write plan classifies each file as create, identical, preserve, conflict, or overwrite.
7. Missing third-party packages are installed with argument arrays and `shell: false`.

This separation lets tests call project operations directly and makes the executable a thin presentation layer.

## Safety invariants

- Configured and command-line paths must remain inside the selected project root.
- Existing custom files are preserved unless `--overwrite` is explicit.
- `--yes` disables prompts; it does not imply destructive overwrite.
- Component adds preserve customized foundation CSS, even with component overwrite. An explicit `init --overwrite` restores the canonical foundation.
- Writes use a same-directory temporary file followed by an atomic rename.
- Package installation occurs before component writes and can be disabled with `--skip-install`.
- Library code throws typed `AliencnError` values and never calls `process.exit`.
- External commands use `spawn` with `shell: false`.

## Registry design

Registry entries contain metadata, canonical source files, output locations, registry dependencies, and package dependencies. Hidden foundation entries provide CSS, the `cn` helper, and interim ambient type shims. Public entries are grouped into dashboard, experiential, and motion components. Motion templates under `templates/registry/motion/` are vendored byte-for-byte from `kya-os-site` (provenance in that directory's README) and are marked `verbatim` so installs and diffs treat them as opaque bytes.

Adding an entry requires:

1. one canonical template in `templates/registry`;
2. one data entry in `src/registry.ts`;
3. catalog documentation;
4. strict TypeScript and transformed JavaScript fixture coverage.

## Verification layers

- Unit tests cover path containment, detection, package-manager arguments, dependency ordering, transforms, conflict policy, and type-quality rules.
- Integration tests exercise Next TypeScript and Vite React JavaScript fixtures.
- The Next fixture compiles every generated template with `strict`, `noImplicitAny`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes`.
- A local compatibility gate compiles experiential templates against the actual typed Space.js and Alien.js worktrees when they are present.
- The Vite fixture bundles every transformed JavaScript component.
- End-to-end tests execute the built CLI through all primary commands.
- Pack validation inspects the actual npm manifest and rejects missing assets or the retired runtime.
