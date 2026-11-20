export class ErrorServicio extends Error {
  constructor(message: string, public readonly codigo: 'validacion' | 'no_encontrado' | 'conflicto' = 'validacion') {
    super(message);
  }
}

export function codigoSql(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return;
  if ('extendedCode' in error && typeof error.extendedCode === 'string') return error.extendedCode;
  if ('code' in error && typeof error.code === 'string') return error.code;
  return 'cause' in error ? codigoSql(error.cause) : undefined;
}

export function errorPublico(error: unknown) {
  if (error instanceof ErrorServicio) return { codigo: error.codigo, mensaje: error.message };
  if (codigoSql(error)?.startsWith('SQLITE_CONSTRAINT_UNIQUE')) {
    return { codigo: 'conflicto', mensaje: 'Ese email ya está en uso. Ingresá otro o editá el cliente existente.' };
  }
  return { codigo: 'interno', mensaje: 'No pudimos completar la operación. Intentá de nuevo.' };
}
