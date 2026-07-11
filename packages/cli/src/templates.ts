import { access, readFile } from 'node:fs/promises';
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
  componentPathOverride?: string
): Promise<RenderedFile[]> {
  const templateRoot = await findTemplateRoot();
  const rendered: RenderedFile[] = [];

  for (const item of items) {
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

async function findTemplateRoot(): Promise<string> {
  const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(moduleDirectory, '..', 'templates', 'registry'),
    path.resolve(moduleDirectory, '..', '..', 'templates', 'registry')
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Continue to the source-tree fallback.
    }
  }
  throw new AliencnError('IO_ERROR', 'The packaged Aliencn registry templates are missing.', {
    candidates
  });
}

function ensureTrailingNewline(value: string): string {
  return value.endsWith('\n') ? value : `${value}\n`;
}
