import type { NextFunction, Request, Response } from 'express';
import { ErrorDeNegocio } from '../servicios/errores.ts';

export function manejarErrores(error: Error, _pedido: Request, respuesta: Response, _siguiente: NextFunction) {
  if (error instanceof ErrorDeNegocio) {
    respuesta.status(409).json({ error: error.message });
    return;
  }
  console.error(error);
  respuesta.status(500).json({ error: 'Error interno del servidor' });
}
