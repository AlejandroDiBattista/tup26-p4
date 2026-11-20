import type { ErrorRequestHandler, RequestHandler } from "express";

import { ErrorConflicto, ErrorNoEncontrado, ErrorValidacion } from "../servicios/errores.js";

export function parseId(valor: unknown, nombre = "id"): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id < 1) throw new ErrorValidacion(`${nombre} inválido`);
  return id;
}

export function cuerpo(body: unknown): Record<string, unknown> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ErrorValidacion("El cuerpo debe ser un objeto JSON");
  }
  return body as Record<string, unknown>;
}

export const noEncontrado: RequestHandler = (req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
};

export const manejarErrores: ErrorRequestHandler = (err, _req, res, _next) => {
  const status =
    err instanceof ErrorNoEncontrado ? 404
    : err instanceof ErrorValidacion ? 400
    : err instanceof ErrorConflicto ? 409
    : err?.type === "entity.parse.failed" ? 400
    : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? "Error interno" : err.message });
};
