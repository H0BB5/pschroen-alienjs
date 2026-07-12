import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { AliencnError } from './errors.js';
import {
  relativeImport,
  resolveWithinRoot,
  stripKnownExtension,
  toPosix
} from './paths.js';
import type {
  AliencnConfig,
  Language,
  RegistryFile,
  RegistryItem,
  RenderedFile
} from './types.js';

export async function renderRegistryItems(
  root: string,
  config: AliencnConfig,
  items: readonly RegistryItem[],
  componentPathOverride?: string,
  optionOverrides: Readonly<Record<string, string>> = {}
): Promise<RenderedFile[]> {
  const templateRoot = await findTemplateRoot();
  const rendered: RenderedFile[] = [];

  for (const item of items) {
    if (item.languages && !item.languages.includes(config.language)) continue;
    for (const file of item.files) {
      const target = outputTarget(config.language, file.target);
      const relativePath = targetPath(config, file, target, componentPathOverride);
      const absolutePath = resolveWithinRoot(root, relativePath, 'Registry output path');
      const sourcePath = path.join(templateRoot, file.source);
      let content: string;

      try {
        content = await readFile(sourcePath, 'utf8');
      } catch (error) {
        throw new AliencnError(
          'IO_ERROR',
          `Unable to read registry template "${file.source}".`,
          { sourcePath },
          { cause: error }
        );
      }

      content = replaceImports(content, root, config, absolutePath);
      content = applyItemOptions(content, item, optionOverrides);
      if (config.language === 'js' && /\.[cm]?tsx?$/u.test(file.source)) {
        content = transpileJavaScript(content, file.source);
      }

      rendered.push({
        item: item.name,
        relativePath: toPosix(relativePath),
        absolutePath,
        content: ensureTrailingNewline(content),
        preserve: file.preserve ?? false
      });
    }
  }
  return rendered;
}

export function outputTarget(language: Language, target: string): string {
  if (language === 'ts') return target;
  return target.replace(/\.tsx$/u, '.jsx').replace(/\.ts$/u, '.js');
}

function targetPath(
  config: AliencnConfig,
  file: RegistryFile,
  target: string,
  componentPathOverride?: string
): string {
  if (file.location === 'styles') return config.paths.styles;
  if (file.location === 'utils') return path.posix.join(config.paths.utils, target);
  return path.posix.join(componentPathOverride ?? config.paths.components, target);
}

function replaceImports(
  source: string,
  root: string,
  config: AliencnConfig,
  outputFile: string
): string {
  const utilityRoot = resolveWithinRoot(root, config.paths.utils, 'Utility path');
  const componentRoot = resolveWithinRoot(root, config.paths.components, 'Component path');
  const utils =
    config.aliases.utils ??
    relativeImport(outputFile, utilityRoot);
  const components =
    config.aliases.components ??
    relativeImport(outputFile, componentRoot);

  return source
    .replaceAll('{{utils}}', stripKnownExtension(utils))
    .replaceAll('{{components}}', stripKnownExtension(components));
}

function applyItemOptions(
  source: string,
  item: RegistryItem,
  overrides: Readonly<Record<string, string>>
): string {
  let output = source;
  for (const option of item.options ?? []) {
    const value = overrides[option.name] ?? option.default;
    if (!option.values.includes(value)) {
      throw new AliencnError(
        'INVALID_ARGUMENT',
        `Invalid value "${value}" for option "${option.name}" of "${item.name}". Allowed values: ${option.values.join(', ')}.`
      );
    }
    output = output.replaceAll(`{{option:${option.name}}}`, value);
  }

  const unresolved = output.match(/\{\{option:([\w-]+)\}\}/u);
  if (unresolved) {
    throw new AliencnError(
      'IO_ERROR',
      `Template for "${item.name}" references undeclared option "${unresolved[1] ?? ''}".`
    );
  }
  return output;
}

function transpileJavaScript(source: string, sourceName: string): string {
  const result = ts.transpileModule(source, {
    fileName: sourceName,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.Preserve,
      isolatedModules: true,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
      removeComments: false
    }
  });

  const errors = (result.diagnostics ?? []).filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
  );
  if (errors.length > 0) {
    const message = ts.formatDiagnostics(errors, {
      getCanonicalFileName: (name) => name,
      getCurrentDirectory: () => process.cwd(),
      getNewLine: () => '\n'
    });
    throw new AliencnError('IO_ERROR', `Unable to create JavaScript template from ${sourceName}:\n${message}`);
  }
  return result.outputText;
}

export const THEME_FILE = 'aliencn-theme.css';

/**
 * Resolves a theme argument to stylesheet content: a packaged preset name
 * (`carbon`, `paper`), or a custom stylesheet path when the value ends with
 * `.css`.
 */
export async function resolveThemeContent(theme: string, root: string): Promise<string> {
  if (theme.endsWith('.css')) {
    const source = path.isAbsolute(theme) ? theme : path.resolve(root, theme);
    try {
      return await readFile(source, 'utf8');
    } catch (error) {
      throw new AliencnError(
        'IO_ERROR',
        `Unable to read the custom theme stylesheet "${theme}".`,
        { source },
        { cause: error }
      );
    }
  }

  const themesRoot = await findTemplateDirectory('themes');
  try {
    return await readFile(path.join(themesRoot, `${theme}.css`), 'utf8');
  } catch {
    const presets = (await readdir(themesRoot))
      .filter((entry) => entry.endsWith('.css'))
      .map((entry) => entry.slice(0, -4))
      .sort();
    throw new AliencnError(
      'INVALID_ARGUMENT',
      `Unknown theme preset "${theme}". Available presets: ${presets.join(', ')}. Pass a .css path for a custom theme.`
    );
  }
}

async function findTemplateRoot(): Promise<string> {
  return findTemplateDirectory('registry');
}

async function findTemplateDirectory(name: string): Promise<string> {
  const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(moduleDirectory, '..', 'templates', name),
    path.resolve(moduleDirectory, '..', '..', 'templates', name)
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Continue to the source-tree fallback.
    }
  }
  throw new AliencnError('IO_ERROR', 'The packaged Aliencn templates are missing.', {
    candidates
  });
}

function ensureTrailingNewline(value: string): string {
  return value.endsWith('\n') ? value : `${value}\n`;
}
