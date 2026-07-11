# CLI reference

## `aliencn init`

Detects React framework, TypeScript/JavaScript, source layout, path aliases, and package manager. It writes `aliencn.json` and the semantic stylesheet.

Options: `--cwd`, `--path`, `--framework`, `--typescript`, `--javascript`, `--yes`, `--overwrite`, `--skip-install`.

## `aliencn add [components...]`

Resolves registry dependencies, installs missing packages, and safely writes one or more components.

Options: `--all`, `--cwd`, `--path`, `--yes`, `--overwrite`, `--skip-install`.

`--yes` preserves conflicts. Use `--overwrite` only after reviewing `aliencn diff`.

## `aliencn list`

Lists public registry entries and whether each entry's owned files exist. Add `--json` for automation.

## `aliencn diff [components...]`

Compares installed files with current canonical templates. Changed files produce unified patches; missing or changed output returns status 1. Use `--all` to compare the full catalog.

## `aliencn doctor`

Checks project detection, React declaration, configuration schema, path containment, stylesheet and registry-foundation presence, installed component state, and required package declarations. Add `--json` for CI or editor integrations.

## Library API

The package exports `initProject`, `addComponents`, `listComponents`, `diffComponents`, `doctor`, registry utilities, config readers, and `AliencnError`. The APIs return structured values and throw errors; they do not terminate the caller.
