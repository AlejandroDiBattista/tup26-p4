import type { ErrorRequestHandler } from "express";

export const manejarErrores: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof SyntaxError && "status" in error && error.status === 400) {
    res.status(400).json({
      error: { codigo: "JSON_INVALIDO", mensaje: "El cuerpo de la solicitud no contiene JSON válido." },
    });
    return;
  }

  res.status(500).json({
    error: { codigo: "INTERNO", mensaje: "Ocurrió un error interno." },
  });
};
