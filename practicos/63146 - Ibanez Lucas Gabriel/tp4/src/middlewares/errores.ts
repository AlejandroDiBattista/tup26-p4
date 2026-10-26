// Respuestas de error de la API, siempre en JSON: { "error": "mensaje" }.
import type { ErrorRequestHandler, RequestHandler } from "express";
import { ErrorNegocio } from "../services/errores.js";

/** Ruta de la API inexistente => 404. */
export const rutaNoEncontrada: RequestHandler = (req, res) => {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}` });
};

/** Manejador global: errores de negocio con su status, errores del cliente HTTP con el suyo y el resto 500. */
export const manejarErrores: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ErrorNegocio) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  // Errores de express.json(): JSON mal formado, body demasiado grande, etc.
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: "El cuerpo no es un JSON válido" });
    return;
  }
  if (typeof err?.status === "number" && err.status >= 400 && err.status < 500) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
};
