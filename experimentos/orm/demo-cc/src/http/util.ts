import { ErrorValidacion } from "../clientes/errores.js";

/** Convierte un parámetro de ruta en id numérico. */
export function parseId(valor: unknown, nombre = "id"): number {
  const id = Number(valor);
  if (!Number.isInteger(id) || id < 1) throw new ErrorValidacion(`${nombre} inválido: ${String(valor)}`);
  return id;
}

/** Toma solo los parámetros de query presentes, de tipo texto, de la lista permitida. */
export function pick<K extends string>(query: Record<string, unknown>, claves: readonly K[]) {
  const salida: Partial<Record<K, string>> = {};
  for (const k of claves) if (typeof query[k] === "string") salida[k] = query[k];
  return salida;
}

/** El cuerpo de la petición debe ser un objeto JSON. */
export function cuerpo(body: unknown): Record<string, unknown> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ErrorValidacion("El cuerpo debe ser un objeto JSON");
  }
  return body as Record<string, unknown>;
}
