import type { NextFunction, Request, Response } from 'express';
import { ErrorNegocio } from '../services/clientes';

export function noEncontrado(_req: Request, res: Response) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

export function manejarErrores(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ErrorNegocio) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err instanceof SyntaxError) {
    res.status(400).json({ error: 'JSON inválido' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
