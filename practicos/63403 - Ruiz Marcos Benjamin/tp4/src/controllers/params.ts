import type { Request } from 'express';
import { ErrorNegocio } from '../services/clientes';

/** Lee un parámetro de ruta como id numérico positivo. */
export function idParam(req: Request, nombre: string): number {
  const id = Number(req.params[nombre]);
  if (!Number.isInteger(id) || id <= 0) throw new ErrorNegocio(`El parámetro ${nombre} no es válido`);
  return id;
}
