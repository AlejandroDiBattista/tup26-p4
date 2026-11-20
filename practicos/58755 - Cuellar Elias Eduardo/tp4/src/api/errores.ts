import type { ErrorRequestHandler, RequestHandler, Response } from "express";
import { ErrorDominio, type CodigoError } from "../servicios/errores.js";

// Formato único de error de la API: { "error": { "codigo", "mensaje", "campo"? } }
type CodigoHttp = CodigoError | "SOLICITUD_INVALIDA" | "RUTA_NO_ENCONTRADA" | "INTERNO";

const STATUS_POR_CODIGO: Record<CodigoError, number> = {
  VALIDACION: 400,
  NO_ENCONTRADO: 404,
  CONFLICTO: 409,
  REGLA_NEGOCIO: 422,
};

function responderError(res: Response, status: number, codigo: CodigoHttp, mensaje: string, campo?: string): void {
  res.status(status).json({ error: { codigo, mensaje, ...(campo ? { campo } : {}) } });
}

/** Errores de body-parser (JSON mal formado, cuerpo demasiado grande): traen status 4xx y expose. */
function esErrorDeSolicitud(error: unknown): error is { status: number; message: string } {
  if (typeof error !== "object" || error === null) return false;
  const { status, expose } = error as { status?: unknown; expose?: unknown };
  return typeof status === "number" && status >= 400 && status < 500 && expose === true;
}

export const rutaNoEncontrada: RequestHandler = (req, res) => {
  responderError(res, 404, "RUTA_NO_ENCONTRADA", `No existe ${req.method} ${req.originalUrl}`);
};

export const manejarErrores: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) return next(error);

  if (error instanceof ErrorDominio) {
    return responderError(res, STATUS_POR_CODIGO[error.codigo], error.codigo, error.message, error.campo);
  }
  if (esErrorDeSolicitud(error)) {
    const mensaje = error.status === 400 ? "El cuerpo de la solicitud no es un JSON válido" : error.message;
    return responderError(res, error.status, "SOLICITUD_INVALIDA", mensaje);
  }

  console.error(error);
  responderError(res, 500, "INTERNO", "Error interno del servidor");
};
