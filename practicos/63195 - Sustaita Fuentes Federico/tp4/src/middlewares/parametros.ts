import type { NextFunction, Request, Response } from 'express';
import { invalido } from '../utils/errores';

// Rechaza ids que no sean enteros positivos antes de llegar al controlador.
export function validarId(req: Request, res: Response, next: NextFunction, valor: string) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) return next(invalido('El id debe ser un número entero positivo'));
  next();
}
