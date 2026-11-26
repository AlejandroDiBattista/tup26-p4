import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** Error de negocio con el código HTTP asociado. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/** Traduce cualquier error a una respuesta JSON uniforme. */
export function responderError(res: Response, error: unknown): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
}

/** Envuelve un controlador async para que sus errores lleguen a responderError. */
export function manejar(
  controlador: (req: Request, res: Response) => Promise<void>,
): RequestHandler {
  return (req: Request, res: Response, _next: NextFunction) => {
    controlador(req, res).catch((error: unknown) => responderError(res, error));
  };
}

/** Convierte y valida el :id de la ruta. */
export function leerId(valor: string | undefined): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'Identificador inválido');
  }
  return id;
}
