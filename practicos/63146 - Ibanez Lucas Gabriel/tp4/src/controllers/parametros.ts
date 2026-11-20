import { DatosInvalidos } from "../services/errores.js";

/** Convierte un parámetro de ruta en id entero positivo, o responde 400. */
export function idDe(valor: unknown, nombre = "id"): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new DatosInvalidos(`El parámetro ${nombre} debe ser un entero positivo`);
  return id;
}

/** El body debe ser un objeto JSON; sin body se toma como vacío. */
export function cuerpo(body: unknown): Record<string, unknown> {
  if (body === undefined) return {};
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new DatosInvalidos("El cuerpo debe ser un objeto JSON");
  }
  return body as Record<string, unknown>;
}
