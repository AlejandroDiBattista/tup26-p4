import type { ErrorRequestHandler, RequestHandler } from "express";
import { ErrorConflicto, ErrorNoEncontrado, ErrorValidacion } from "../clientes/errores.js";

export const noEncontrado: RequestHandler = (req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
};

export const manejarErrores: ErrorRequestHandler = (err, _req, res, _next) => {
  const status =
    err instanceof ErrorNoEncontrado ? 404
    : err instanceof ErrorValidacion ? 400
    : err instanceof ErrorConflicto ? 409
    : err?.type === "entity.parse.failed" ? 400 // JSON mal formado
    : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? "Error interno" : err.message });
};
