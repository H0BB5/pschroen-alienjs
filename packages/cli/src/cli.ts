import { checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { Command, CommanderError, Option } from 'commander';

import packageJson from '../package.json';
import { AliencnError } from './errors.js';
import {
  addComponents,
  diffComponents,
  doctor,
  initProject,
  listComponents
} from './operations.js';
import type { Framework, Language, PlannedFile } from './types.js';

export interface SelectChoice {
  name: string;
  value: string;
}

export interface CliIO {
  stdout: (message: string) => void;
  stderr: (message: string) => void;
  confirm: (message: string) => Promise<boolean>;
  /** Multi-select prompt; absent in non-interactive environments. */
  select?: (message: string, choices: readonly SelectChoice[]) => Promise<string[]>;
}

const defaultIO: CliIO = {
  stdout: (message) => console.log(message),
  stderr: (message) => console.error(message),
  confirm: (message) => confirm({ message, default: false }),
  ...(process.stdin.isTTY
    ? {
        select: (message: string, choices: readonly SelectChoice[]) =>
          checkbox({ message, choices: choices.map((choice) => ({ ...choice })) })
      }
    : {})
};

interface CommonCliOptions {
  cwd?: string;
  json?: boolean;
}

interface InitCliOptions extends CommonCliOptions {
  path?: string;
  framework?: string;
  typescript?: boolean;
  javascript?: boolean;
  yes?: boolean;
  overwrite?: boolean;
  skipInstall?: boolean;
  dryRun?: boolean;
}

interface AddCliOptions extends CommonCliOptions {
  path?: string;
  all?: boolean;
  yes?: boolean;
  overwrite?: boolean;
  skipInstall?: boolean;
  dryRun?: boolean;
}

interface DiffCliOptions extends CommonCliOptions {
  path?: string;
  all?: boolean;
}

export function createProgram(io: CliIO = defaultIO): Command {
  let commandStatus = 0;
  const program = new Command()
    .name('aliencn')
    .description('Install source-owned React, Space.js, and Alien.js components.')
    .version(packageJson.version)
    .showHelpAfterError()
    .exitOverride()
    .configureOutput({
      writeOut: (value) => io.stdout(value.trimEnd()),
      writeErr: (value) => io.stderr(value.trimEnd())
    });

  program
    .command('init')
    .description('Detect and initialize the current React project.')
    .option('--cwd <path>', 'Project directory', process.cwd())
    .option('--path <path>', 'Component output directory')
    .addOption(
      new Option('--framework <framework>', 'Framework override').choices(['next', 'vite', 'react'])
    )
    .option('--typescript', 'Force TypeScript output')
    .option('--javascript', 'Force JavaScript output')
    .option('-y, --yes', 'Accept safe defaults without prompting')
    .option('--overwrite', 'Replace config and restore canonical registry foundations')
    .option('--skip-install', 'Do not invoke the package manager')
    .option('--dry-run', 'Report what would change without writing anything')
    .action(async (options: InitCliOptions) => {
      const language = languageOption(options);
      if (!options.yes && !options.dryRun) {
        const accepted = await io.confirm('Initialize Aliencn in this project?');
        if (!accepted) {
          io.stdout(chalk.yellow('Initialization cancelled.'));
          commandStatus = 1;
          return;
        }
      }
      const result = await initProject({
        ...(options.cwd ? { cwd: options.cwd } : {}),
        ...(options.path ? { path: options.path } : {}),
        ...(options.framework ? { framework: parseFramework(options.framework) } : {}),
        ...(language ? { language } : {}),
        ...(options.yes !== undefined ? { yes: options.yes } : {}),
        ...(options.overwrite !== undefined ? { overwrite: options.overwrite } : {}),
        ...(options.skipInstall !== undefined ? { skipInstall: options.skipInstall } : {}),
        ...(options.dryRun !== undefined ? { dryRun: options.dryRun } : {}),
        confirm: io.confirm
      });
      if (result.plan) {
        io.stdout(chalk.cyan(`Would create ${result.configPath}`));
        printPlan(io, result.plan);
        io.stdout(chalk.dim('Dry run: nothing was written.'));
        return;
      }
      io.stdout(chalk.green(`Created ${result.configPath}`));
      io.stdout(
        `Detected ${result.config.framework}, ${result.config.language}, and ${result.packageManager}.`
      );
      io.stdout(`Import ${result.config.paths.styles} once from your application entry point.`);
    });

  program
    .command('add')
    .description('Add one or more registry components.')
    .argument('[components...]', 'Registry component names')
    .option('--cwd <path>', 'Project directory', process.cwd())
    .option('--path <path>', 'Override component output directory for this operation')
    .option('--all', 'Add every public component')
    .option('-y, --yes', 'Never prompt; preserve conflicting user files')
    .option('--overwrite', 'Overwrite conflicting component files')
    .option('--skip-install', 'Write files without installing missing packages')
    .option('--dry-run', 'Report what would change without writing or installing')
    .action(async (components: string[], options: AddCliOptions) => {
      let names = components;
      if (names.length === 0 && !options.all && io.select) {
        const entries = await listComponents(options.cwd ? { cwd: options.cwd } : {});
        names = await io.select(
          'Select components to add',
          entries.map((entry) => ({
            name: `${entry.name} - ${entry.description}`,
            value: entry.name
          }))
        );
        if (names.length === 0) {
          io.stdout(chalk.yellow('No components selected.'));
          commandStatus = 1;
          return;
        }
      }
      const result = await addComponents(names, {
        ...(options.cwd ? { cwd: options.cwd } : {}),
        ...(options.path ? { path: options.path } : {}),
        ...(options.all !== undefined ? { all: options.all } : {}),
        ...(options.yes !== undefined ? { yes: options.yes } : {}),
        ...(options.overwrite !== undefined ? { overwrite: options.overwrite } : {}),
        ...(options.skipInstall !== undefined ? { skipInstall: options.skipInstall } : {}),
        ...(options.dryRun !== undefined ? { dryRun: options.dryRun } : {}),
        confirm: io.confirm
      });
      if (result.plan) {
        printPlan(io, result.plan);
        if (result.packages.length > 0) {
          io.stdout(chalk.yellow(`Would install: ${result.packages.join(' ')}`));
        }
        io.stdout(chalk.dim('Dry run: nothing was written or installed.'));
        return;
      }
      const changed =
        result.writes.created.length > 0 || result.writes.overwritten.length > 0;
      io.stdout(
        changed
          ? chalk.green(`Added ${result.items.join(', ')}.`)
          : chalk.dim(`${result.items.join(', ')}: already up to date.`)
      );
      printWrites(io, result.writes);
      if (options.skipInstall && result.packages.length > 0) {
        io.stdout(chalk.yellow(`Install manually: ${result.packages.join(' ')}`));
      }
    });

  program
    .command('list')
    .description('List registry components and local installation state.')
    .option('--cwd <path>', 'Project directory', process.cwd())
    .option('--json', 'Print machine-readable JSON')
    .action(async (options: CommonCliOptions) => {
      const entries = await listComponents(options.cwd ? { cwd: options.cwd } : {});
      if (options.json) {
        io.stdout(JSON.stringify(entries, null, 2));
        return;
      }
      for (const entry of entries) {
        const marker = entry.installed ? chalk.green('installed') : chalk.dim('available');
        io.stdout(`${entry.name.padEnd(16)} ${marker.padEnd(18)} ${entry.description}`);
      }
    });

  program
    .command('diff')
    .description('Compare installed files with their registry source.')
    .argument('[components...]', 'Registry component names')
    .option('--cwd <path>', 'Project directory', process.cwd())
    .option('--path <path>', 'Override component output directory for this operation')
    .option('--all', 'Compare every public component')
    .option('--json', 'Print machine-readable JSON')
    .action(async (components: string[], options: DiffCliOptions) => {
      const entries = await diffComponents(components, {
        ...(options.cwd ? { cwd: options.cwd } : {}),
        ...(options.path ? { path: options.path } : {}),
        ...(options.all !== undefined ? { all: options.all } : {})
      });
      if (options.json) {
        io.stdout(JSON.stringify(entries, null, 2));
      } else {
        for (const entry of entries) {
          if (entry.state === 'clean') io.stdout(chalk.green(`clean   ${entry.path}`));
          if (entry.state === 'missing') io.stdout(chalk.red(`missing ${entry.path}`));
          if (entry.state === 'changed') io.stdout(entry.patch ?? `changed ${entry.path}`);
        }
      }
      if (entries.some((entry) => entry.state !== 'clean')) commandStatus = 1;
    });

  program
    .command('doctor')
    .description('Validate project detection, configuration, paths, styles, and dependencies.')
    .option('--cwd <path>', 'Project directory', process.cwd())
    .option('--json', 'Print machine-readable JSON')
    .action(async (options: CommonCliOptions) => {
      const report = await doctor(options.cwd ? { cwd: options.cwd } : {});
      if (options.json) {
        io.stdout(JSON.stringify(report, null, 2));
      } else {
        for (const check of report.checks) {
          const marker =
            check.status === 'pass'
              ? chalk.green('PASS')
              : check.status === 'warn'
                ? chalk.yellow('WARN')
                : chalk.red('FAIL');
          io.stdout(`${marker} ${check.name}: ${check.message}`);
        }
      }
      if (!report.healthy) commandStatus = 1;
    });

  program.hook('postAction', () => {
    program.setOptionValue('__status', commandStatus);
  });
  return program;
}

export async function runCli(argv: readonly string[], io: CliIO = defaultIO): Promise<number> {
  const program = createProgram(io);
  try {
    await program.parseAsync([...argv], { from: 'user' });
    const status = program.getOptionValue('__status');
    return typeof status === 'number' ? status : 0;
  } catch (error) {
    if (error instanceof CommanderError) {
      if (error.code === 'commander.helpDisplayed' || error.code === 'commander.version') return 0;
      io.stderr(chalk.red(error.message));
      return error.exitCode || 1;
    }
    if (error instanceof AliencnError) {
      io.stderr(chalk.red(`${error.code}: ${error.message}`));
      return 1;
    }
    io.stderr(chalk.red(error instanceof Error ? error.message : 'Unexpected Aliencn failure.'));
    return 1;
  }
}

function languageOption(options: InitCliOptions): Language | undefined {
  if (options.typescript && options.javascript) {
    throw new AliencnError(
      'INVALID_ARGUMENT',
      '--typescript and --javascript cannot be used together.'
    );
  }
  if (options.typescript) return 'ts';
  if (options.javascript) return 'js';
  return undefined;
}

function parseFramework(value: string): Framework {
  if (value === 'next' || value === 'vite' || value === 'react') return value;
  throw new AliencnError('INVALID_ARGUMENT', `Unsupported framework "${value}".`);
}

function printWrites(
  io: CliIO,
  writes: { created: string[]; overwritten: string[]; skipped: string[] }
): void {
  for (const file of writes.created) io.stdout(chalk.green(`create    ${file}`));
  for (const file of writes.overwritten) io.stdout(chalk.yellow(`overwrite ${file}`));
  for (const file of writes.skipped) io.stdout(chalk.dim(`preserve  ${file}`));
}

function printPlan(io: CliIO, plan: readonly PlannedFile[]): void {
  for (const file of plan) {
    const label =
      file.action === 'create'
        ? chalk.green('would create   ')
        : file.action === 'overwrite'
          ? chalk.yellow('would overwrite')
          : file.action === 'conflict'
            ? chalk.red('conflict       ')
            : chalk.dim('unchanged      ');
    io.stdout(`${label} ${file.relativePath}`);
  }
}
