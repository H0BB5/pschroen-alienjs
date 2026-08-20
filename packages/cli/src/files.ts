import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { AliencnError } from './errors.js';
import type {
  ConfirmHandler,
  PlannedFile,
  RenderedFile,
  WriteSummary
} from './types.js';

export async function planWrites(
  files: readonly RenderedFile[],
  overwrite = false,
  overwritePreserved = false
): Promise<PlannedFile[]> {
  return Promise.all(
    files.map(async (file): Promise<PlannedFile> => {
      const existing = await readOptional(file.absolutePath);
      if (existing === null) return { ...file, action: 'create' };
      if (existing === file.content || (file.preserve && !overwritePreserved)) {
        return { ...file, action: 'skip' };
      }
      return { ...file, action: overwrite ? 'overwrite' : 'conflict' };
    })
  );
}

export async function resolveConflicts(
  files: readonly PlannedFile[],
  confirm: ConfirmHandler,
  yes = false
): Promise<PlannedFile[]> {
  const resolved: PlannedFile[] = [];
  for (const file of files) {
    if (file.action !== 'conflict') {
      resolved.push(file);
      continue;
    }

    const accepted = yes ? false : await confirm(`Overwrite ${file.relativePath}?`);
    resolved.push({ ...file, action: accepted ? 'overwrite' : 'skip' });
  }
  return resolved;
}

export async function writePlannedFiles(files: readonly PlannedFile[]): Promise<WriteSummary> {
  const summary: WriteSummary = { created: [], overwritten: [], skipped: [] };
  for (const file of files) {
    if (file.action === 'conflict') {
      throw new AliencnError('CONFLICT', `Unresolved file conflict: ${file.relativePath}`);
    }
    if (file.action === 'skip') {
      summary.skipped.push(file.relativePath);
      continue;
    }
    await atomicWrite(file.absolutePath, file.content);
    if (file.action === 'create') summary.created.push(file.relativePath);
    else summary.overwritten.push(file.relativePath);
  }
  return summary;
}

export async function atomicWrite(target: string, content: string): Promise<void> {
  const directory = path.dirname(target);
  await mkdir(directory, { recursive: true });
  const temporary = path.join(
    directory,
    `.${path.basename(target)}.aliencn-${process.pid}-${crypto.randomUUID()}`
  );
  try {
    await writeFile(temporary, content, { encoding: 'utf8', flag: 'wx' });
    await rename(temporary, target);
  } catch (error) {
    await rm(temporary, { force: true });
    throw new AliencnError('IO_ERROR', `Unable to write ${target}.`, { target }, { cause: error });
  }
}

async function readOptional(target: string): Promise<string | null> {
  try {
    return await readFile(target, 'utf8');
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') return null;
    throw new AliencnError('IO_ERROR', `Unable to inspect ${target}.`, { target }, { cause: error });
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
