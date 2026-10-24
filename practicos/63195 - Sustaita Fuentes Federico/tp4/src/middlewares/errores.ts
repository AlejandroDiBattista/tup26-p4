import type { NextFunction, Request, Response } from 'express';
import { ErrorNegocio } from '../utils/errores';

const ESTADOS = { validacion: 400, 'no-encontrado': 404, conflicto: 409 } as const;

export function rutaNoEncontrada(req: Request, res: Response) {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}` });
}

export function manejarErrores(error: any, req: Request, res: Response, next: NextFunction) {
  if (error instanceof ErrorNegocio) {
    return res.status(ESTADOS[error.tipo]).json({ error: error.message });
  }
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo no es un JSON válido' });
  }
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
}
