import type { NextFunction, Request, Response } from "express";
import { ErrorNegocio } from "../services/errores.ts";

/** Ruta inexistente dentro de /api. */
export function rutaNoEncontrada(_req: Request, res: Response) {
  res.status(404).json({ error: "Ruta no encontrada" });
}

/** Convierte cualquier error en una respuesta JSON { error }. */
export function manejarErrores(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ErrorNegocio) {
    res.status(err.status).json({ error: err.message });
  } else if (err instanceof SyntaxError) {
    res.status(400).json({ error: "JSON mal formado" });
  } else {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
