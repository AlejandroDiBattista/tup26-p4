import type { NextFunction, Request, Response } from "express";

import { ErrorDeNegocio } from "../services/clientes.js";

export type Cuerpo = Record<string, unknown>;

export function cuerpoDeSolicitud(body: unknown): Cuerpo {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new ErrorDeNegocio("El cuerpo debe ser un objeto JSON.", "VALIDACION");
  }
  return body as Cuerpo;
}

export function idDeRuta(valor: unknown): number {
  if (typeof valor !== "string" || !/^\d+$/.test(valor)) {
    throw new ErrorDeNegocio("El identificador debe ser un entero positivo.", "VALIDACION");
  }
  return Number(valor);
}

export function responder<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ data, error: null });
}

export function responderEliminacion(res: Response, id: number): void {
  responder(res, { id });
}

export function errorHttp(error: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof ErrorDeNegocio) {
    const status = error.codigo === "VALIDACION" ? 400
      : error.codigo === "NO_ENCONTRADO" ? 404
        : 409;
    res.status(status).json({ data: null, error: { code: error.codigo, message: error.message } });
    return;
  }

  if (error instanceof SyntaxError && "status" in error && error.status === 400) {
    res.status(400).json({ data: null, error: { code: "JSON_INVALIDO", message: "El cuerpo no contiene JSON válido." } });
    return;
  }

  const status = typeof error === "object" && error !== null && "status" in error
    ? Number((error as { status?: unknown }).status)
    : 500;
  if (status === 413) {
    res.status(413).json({ data: null, error: { code: "CUERPO_GRANDE", message: "El cuerpo de la solicitud es demasiado grande." } });
    return;
  }

  console.error(`Error al procesar ${req.method} ${req.path}:`, error);
  res.status(500).json({ data: null, error: { code: "ERROR_INTERNO", message: "Ocurrió un error interno." } });
}
