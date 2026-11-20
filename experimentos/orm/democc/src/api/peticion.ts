import type { Request } from 'express';
import { DatosInvalidos } from '../servicios/errores';

/** Convierte un parámetro de ruta en un id numérico. */
export function leerId(req: Request, parametro: 'clienteId' | 'actividadId'): number {
  const id = Number(req.params[parametro]);
  if (!Number.isInteger(id) || id <= 0) {
    throw new DatosInvalidos(`El parámetro ${parametro} debe ser un número entero positivo.`);
  }
  return id;
}

/** Devuelve el cuerpo JSON de la petición, que debe ser un objeto. */
export function leerCuerpo(req: Request) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    throw new DatosInvalidos('El cuerpo de la petición debe ser un objeto JSON.');
  }
  return req.body;
}
