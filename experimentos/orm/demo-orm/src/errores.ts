import { ZodError } from 'zod';

export class ErrorServicio extends Error {
  constructor(public estado: number, mensaje: string) {
    super(mensaje);
  }
}

export function describirError(error: unknown) {
  if (error instanceof ErrorServicio) return { estado: error.estado, error: error.message };
  if (error instanceof ZodError) {
    return { estado: 400, error: error.issues.map(e => `${e.path.join('.') || 'Datos'}: ${e.message}`).join('; ') };
  }
  // Drizzle conserva el error del driver en cause.
  const causa = error instanceof Error && error.cause ? error.cause : error;
  if (causa instanceof Error && causa.message.includes('UNIQUE constraint failed: clientes.email')) {
    return { estado: 409, error: 'Ya existe un cliente con ese email.' };
  }
  console.error(error);
  return { estado: 500, error: 'No se pudo completar la operación.' };
}
