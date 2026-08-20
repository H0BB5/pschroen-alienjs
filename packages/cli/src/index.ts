export { createProgram, runCli } from './cli.js';
export type { CliIO } from './cli.js';
export { CONFIG_FILE, CONFIG_SCHEMA_URL, readConfig, requireConfig } from './config.js';
export { AliencnError } from './errors.js';
export type { AliencnErrorCode } from './errors.js';
export {
  addComponents,
  diffComponents,
  doctor,
  initProject,
  listComponents
} from './operations.js';
export type { AddResult, DiffEntry, InitResult, ListEntry } from './operations.js';
export {
  collectPackageDependencies,
  getRegistryItem,
  publicRegistryItems,
  registry,
  resolveRegistryItems
} from './registry.js';
export { renderRegistryItems } from './templates.js';
export type {
  AddOptions,
  AliencnConfig,
  ConfirmHandler,
  DiffOptions,
  DoctorCheck,
  DoctorReport,
  FileAction,
  Framework,
  InitOptions,
  Language,
  ListOptions,
  PackageManager,
  PackageJson,
  PlannedFile,
  ProjectInfo,
  RegistryCategory,
  RegistryFile,
  RegistryItem,
  RegistryLocation,
  RenderedFile,
  WriteSummary
} from './types.js';
