import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { z } from 'zod';

import { AliencnError } from './errors.js';
import { atomicWrite } from './files.js';
import { normalizeProjectPath } from './paths.js';
import type { AliencnConfig } from './types.js';

export const CONFIG_FILE = 'aliencn.json';
export const CONFIG_SCHEMA_URL =
  'https://raw.githubusercontent.com/H0BB5/pschroen-alienjs/main/packages/cli/schema.json';

const projectPathSchema = z.string().min(1).transform((value, context) => {
  try {
    return normalizeProjectPath(value, 'Configured path');
  } catch (error) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: error instanceof Error ? error.message : 'Invalid project path'
    });
    return z.NEVER;
  }
});

export const aliencnConfigSchema = z
  .object({
    $schema: z.string().url().optional(),
    version: z.literal(1),
    framework: z.enum(['next', 'vite', 'react']),
    language: z.enum(['ts', 'js']),
    theme: z.string().min(1).optional(),
    paths: z.object({
      components: projectPathSchema,
      utils: projectPathSchema,
      styles: projectPathSchema
    }),
    aliases: z.object({
      components: z.string().min(1).nullable(),
      utils: z.string().min(1).nullable()
    })
  })
  .strict();

export function getConfigPath(root: string): string {
  return path.join(root, CONFIG_FILE);
}

export async function readConfig(root: string): Promise<AliencnConfig | null> {
  const configPath = getConfigPath(root);
  let source: string;

  try {
    source = await readFile(configPath, 'utf8');
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return null;
    }
    throw new AliencnError('IO_ERROR', `Unable to read ${CONFIG_FILE}.`, { configPath }, { cause: error });
  }

  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch (error) {
    throw new AliencnError(
      'CONFIG_INVALID',
      `${CONFIG_FILE} contains invalid JSON.`,
      { configPath },
      { cause: error }
    );
  }

  const result = aliencnConfigSchema.safeParse(value);
  if (!result.success) {
    throw new AliencnError('CONFIG_INVALID', `${CONFIG_FILE} is invalid: ${result.error.issues
      .map((issue) => `${issue.path.join('.') || 'config'}: ${issue.message}`)
      .join('; ')}`, { configPath });
  }

  return result.data;
}

export async function requireConfig(root: string): Promise<AliencnConfig> {
  const config = await readConfig(root);
  if (!config) {
    throw new AliencnError('CONFIG_MISSING', `No ${CONFIG_FILE} found. Run \`aliencn init\` first.`, {
      root
    });
  }
  return config;
}

export async function writeConfig(root: string, config: AliencnConfig): Promise<void> {
  const parsed = aliencnConfigSchema.parse(config);
  await atomicWrite(getConfigPath(root), `${JSON.stringify(parsed, null, 2)}\n`);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
