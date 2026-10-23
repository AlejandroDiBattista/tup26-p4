import type { NextFunction, Request, Response } from "express";
import { Conflicto, NoEncontrado, ReglaDeNegocio } from "../servicios/errores.js";

/** Petición mal formada (body o parámetros inválidos). */
export class ErrorDeSolicitud extends Error {}

/** Ruta inexistente. */
export function noEncontrado(req: Request, res: Response): void {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}` });
}

/**
 * Traduce los errores a códigos HTTP. Las reglas de negocio viven en el
 * servicio; acá solo se elige el estado de la respuesta.
 */
export function manejarErrores(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof ErrorDeSolicitud) {
    res.status(400).json({ error: error.message });
    return;
  }
  if (error instanceof NoEncontrado) {
    res.status(404).json({ error: error.message });
    return;
  }
  if (error instanceof Conflicto) {
    res.status(409).json({ error: error.message });
    return;
  }
  if (error instanceof ReglaDeNegocio) {
    res.status(409).json({ error: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Error interno" });
}
