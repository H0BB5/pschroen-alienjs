export type AliencnErrorCode =
  | 'CONFIG_INVALID'
  | 'CONFIG_MISSING'
  | 'CONFLICT'
  | 'DEPENDENCY_CYCLE'
  | 'INSTALL_FAILED'
  | 'INVALID_ARGUMENT'
  | 'IO_ERROR'
  | 'PROJECT_UNSUPPORTED'
  | 'REGISTRY_NOT_FOUND';

export class AliencnError extends Error {
  readonly code: AliencnErrorCode;
  readonly details?: Readonly<Record<string, unknown>>;

  constructor(
    code: AliencnErrorCode,
    message: string,
    details?: Readonly<Record<string, unknown>>,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'AliencnError';
    this.code = code;
    if (details !== undefined) {
      this.details = details;
    }
  }
}

export function toAliencnError(error: unknown, fallback: string): AliencnError {
  if (error instanceof AliencnError) {
    return error;
  }

  return new AliencnError(
    'IO_ERROR',
    error instanceof Error ? error.message : fallback,
    undefined,
    error instanceof Error ? { cause: error } : undefined
  );
}
