import type { Request, Response, NextFunction } from 'express';
import { ErrorHttp } from '../utils/error-http.ts';

export function noEncontrado(req: Request, res: Response) {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}` });
}

export function manejarErrores(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof ErrorHttp) {
    res.status(error.estado).json({ error: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
}