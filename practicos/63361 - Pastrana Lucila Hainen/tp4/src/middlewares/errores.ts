import type { NextFunction, Request, Response } from "express";
import { ErrorNoEncontrado, ErrorReglaNegocio, ErrorValidacion } from "../services/errores";

/** Respuesta de error estándar: { error: { status, tipo, mensaje } } */
function enviar(res: Response, status: number, tipo: string, mensaje: string) {
  res.status(status).json({ error: { status, tipo, mensaje } });
}

/** Ruta /api inexistente. */
export function rutaNoEncontrada(req: Request, res: Response) {
  enviar(res, 404, "RutaNoEncontrada", `No existe ${req.method} ${req.originalUrl}`);
}

export function manejarErrores(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ErrorValidacion || err instanceof ErrorNoEncontrado || err instanceof ErrorReglaNegocio) {
    enviar(res, err.status, err.name, err.message);
    return;
  }
  // JSON mal formado enviado por el cliente (body-parser).
  if (err instanceof SyntaxError && (err as { type?: string }).type === "entity.parse.failed") {
    enviar(res, 400, "JsonInvalido", "El cuerpo de la petición no es un JSON válido");
    return;
  }
  console.error(err);
  enviar(res, 500, "ErrorInterno", "Error interno del servidor");
}
