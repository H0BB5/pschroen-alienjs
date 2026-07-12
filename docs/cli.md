# CLI reference

## `aliencn init`

Detects React framework, TypeScript/JavaScript, source layout, path aliases, and package manager. It writes `aliencn.json` and the semantic stylesheet.

Aliases are derived from the actual `tsconfig.json`/`jsconfig.json` `paths` mapping targets, following `extends` chains; when no mapping covers the output directory, generated components fall back to relative imports.
Package-manager detection walks up parent directories, so workspace subpackages resolve the repository's pnpm, Yarn, or Bun lockfile instead of defaulting to npm.
Next.js projects without an App Router `app` directory receive the stylesheet in `styles/` instead of creating a stray `app/` directory.

Options: `--cwd`, `--path`, `--framework`, `--typescript`, `--javascript`, `--yes`, `--overwrite`, `--skip-install`, `--dry-run`.

Cancelling the interactive confirmation exits with status 1.

## `aliencn add [components...]`

Resolves registry dependencies, installs missing packages, and safely writes one or more components.
Run it with no arguments in an interactive terminal to pick components from a checklist.
A declared dependency whose version range cannot satisfy a template requirement (for example `three@^0.150.0` against `^0.185.1`) is treated as missing and reinstalled.

TypeScript projects also receive interim ambient declaration files (`space-types.d.ts`, `alien-types.d.ts`) with the experiential components, because the published `@alienkitty` packages do not ship their own types yet.
Delete those files once upstream releases include type declarations.

Options: `--all`, `--cwd`, `--path`, `--yes`, `--overwrite`, `--skip-install`, `--dry-run`.

`--yes` preserves conflicts. Use `--overwrite` only after reviewing `aliencn diff`. `--dry-run` prints the write plan (including conflicts) and the packages that would be installed, then exits without touching anything.

## `aliencn list`

Lists public registry entries and whether each entry's owned files exist. Add `--json` for automation.

## `aliencn diff [components...]`

Compares installed files with current canonical templates. Changed files produce unified patches; missing or changed output returns status 1. Use `--all` to compare the full catalog.

## `aliencn doctor`

Checks project detection, React declaration, configuration schema, path containment, stylesheet and registry-foundation presence, installed component state, and required package declarations. Add `--json` for CI or editor integrations.

## Library API

The package exports `initProject`, `addComponents`, `listComponents`, `diffComponents`, `doctor`, registry utilities, config readers, and `AliencnError`. The APIs return structured values and throw errors; they do not terminate the caller.
