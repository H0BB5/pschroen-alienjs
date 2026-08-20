export type Framework = 'next' | 'vite' | 'react' | 'static';
export type Language = 'ts' | 'js';
export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';
export type RegistryCategory = 'foundation' | 'dashboard' | 'experience' | 'motion';
export type RegistryLocation = 'components' | 'utils' | 'styles';

export interface AliencnConfig {
  $schema?: string | undefined;
  version: 1;
  framework: Framework;
  language: Language;
  /** Token theme applied after the foundation stylesheet: a packaged preset name or the original custom stylesheet path. */
  theme?: string | undefined;
  paths: {
    components: string;
    utils: string;
    styles: string;
  };
  aliases: {
    components: string | null;
    utils: string | null;
  };
}

export interface AliasMapping {
  /** Import prefix without the trailing wildcard, e.g. `@` for `"@/*"`. */
  prefix: string;
  /** Project-relative mapping target without the wildcard; `''` is the project root. */
  target: string;
}

export interface ProjectInfo {
  root: string;
  framework: Framework;
  language: Language;
  packageManager: PackageManager;
  sourceRoot: string;
  /** True when a Next.js project has an App Router `app` directory. */
  appRouter: boolean;
  aliasMappings: readonly AliasMapping[];
  packageJson: PackageJson;
}

export interface PackageJson {
  name?: string | undefined;
  private?: boolean | undefined;
  packageManager?: string | undefined;
  dependencies?: Record<string, string> | undefined;
  devDependencies?: Record<string, string> | undefined;
  peerDependencies?: Record<string, string> | undefined;
}

export interface RegistryFile {
  source: string;
  target: string;
  location: RegistryLocation;
  preserve?: boolean;
  /**
   * Copies the template byte-for-byte: no import rewriting, no option
   * templating, no TypeScript transpilation, and no extension rewrite.
   * Used for vendored framework-agnostic vanilla assets.
   */
  verbatim?: boolean;
}

export interface RegistryOption {
  /** Option key used with `--set <name>=<value>` and `{{option:<name>}}` in templates. */
  name: string;
  values: readonly string[];
  default: string;
}

export interface RegistryItem {
  name: string;
  title: string;
  description: string;
  category: RegistryCategory;
  files: readonly RegistryFile[];
  registryDependencies: readonly string[];
  dependencies: Readonly<Record<string, string>>;
  hidden?: boolean;
  /** Restricts an item to specific project languages; omitted means every language. */
  languages?: readonly Language[];
  /** Install-time template options with enumerated values. */
  options?: readonly RegistryOption[];
}

export interface RenderedFile {
  item: string;
  relativePath: string;
  absolutePath: string;
  content: string;
  preserve: boolean;
}

export type FileAction = 'create' | 'overwrite' | 'skip' | 'conflict';

export interface PlannedFile extends RenderedFile {
  action: FileAction;
}

export interface WriteSummary {
  created: string[];
  overwritten: string[];
  skipped: string[];
}

export interface InitOptions {
  cwd?: string;
  path?: string;
  framework?: Framework;
  language?: Language;
  theme?: string;
  yes?: boolean;
  overwrite?: boolean;
  skipInstall?: boolean;
  dryRun?: boolean;
  confirm?: ConfirmHandler;
}

export interface AddOptions {
  cwd?: string;
  path?: string;
  all?: boolean;
  yes?: boolean;
  overwrite?: boolean;
  skipInstall?: boolean;
  dryRun?: boolean;
  /** Install-time option overrides, keyed by registry option name. */
  set?: Readonly<Record<string, string>>;
  confirm?: ConfirmHandler;
}

export interface DiffOptions {
  cwd?: string;
  path?: string;
  all?: boolean;
}

export interface ListOptions {
  cwd?: string;
}

export interface DoctorCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

export interface DoctorReport {
  healthy: boolean;
  checks: DoctorCheck[];
}

export type ConfirmHandler = (message: string) => Promise<boolean>;
