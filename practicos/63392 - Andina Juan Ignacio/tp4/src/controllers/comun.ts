import type { NextFunction, Request, Response } from "express";
import { ErrorNegocio } from "../services/clientes";

/** Ejecuta el controlador y traduce el error de negocio a una respuesta. */
export function manejar(
  accion: (req: Request, res: Response) => void,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    try {
      accion(req, res);
    } catch (error) {
      next(error);
    }
  };
}

export function manejarErrores(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ErrorNegocio) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Error interno del servidor" });
}
