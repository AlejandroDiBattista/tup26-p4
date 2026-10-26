import type { Request } from "express";
import { ErrorValidacion } from "../services/errores";

/** Lee un parámetro de ruta como id entero positivo. */
export function idParam(req: Request, nombre: string): number {
  const valor = req.params[nombre];
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new ErrorValidacion(`Parámetro "${nombre}" inválido: "${valor}"`);
  return id;
}

/** Cuerpo JSON como objeto (vacío si no se envió). */
export function cuerpo<T>(req: Request): Partial<T> {
  const body: unknown = req.body;
  if (body == null) return {};
  if (typeof body !== "object" || Array.isArray(body)) throw new ErrorValidacion("El cuerpo debe ser un objeto JSON");
  return body as Partial<T>;
}
