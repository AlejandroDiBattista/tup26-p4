import type { NextFunction, Request, Response } from 'express';
import { Conflicto, DatosInvalidos, NoEncontrado } from '../servicios/errores';

/** Responde 404 a las rutas de la API que no existen. */
export function rutaInexistente(req: Request, res: Response) {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}.` });
}

/** Traduce los errores a respuestas JSON con el estado HTTP que corresponde. */
export function manejarErrores(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof DatosInvalidos) return res.status(400).json({ error: error.message });
  if (error instanceof NoEncontrado) return res.status(404).json({ error: error.message });
  if (error instanceof Conflicto) return res.status(409).json({ error: error.message });
  if (esJsonInvalido(error)) return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido.' });

  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor.' });
}

function esJsonInvalido(error: unknown) {
  return error instanceof SyntaxError && (error as { type?: string }).type === 'entity.parse.failed';
}
