import type { NuevoCliente } from "../db/schema.js";

// Quita espacios sobrantes; un texto vacío se guarda como null.
export function limpiar(valor: string | null): string | null {
  const texto = valor?.trim().replace(/\s+/g, " ");
  return texto ? texto : null;
}

// "  maría   josé " -> "María José"
export function normalizarNombre(valor: string): string {
  return (limpiar(valor) ?? "")
    .toLowerCase()
    .replace(/(^|\s)\p{L}/gu, (letra) => letra.toUpperCase());
}

// " Juan.Perez@Mail.COM " -> "juan.perez@mail.com"
export function normalizarEmail(valor: string): string {
  return valor.trim().toLowerCase();
}

// "(341) 555-0101" -> "3415550101"
export function normalizarTelefono(valor: string | null): string | null {
  return limpiar(valor?.replace(/\D/g, "") ?? null);
}

// Normaliza solo los campos presentes (sirve para crear, actualizar y buscar).
export function normalizarCliente<T extends Partial<NuevoCliente>>(datos: T): T {
  const r: Partial<NuevoCliente> = { ...datos };
  if (r.nombre !== undefined) r.nombre = normalizarNombre(r.nombre);
  if (r.apellido !== undefined) r.apellido = normalizarNombre(r.apellido);
  if (r.email !== undefined) r.email = normalizarEmail(r.email);
  if (r.telefono !== undefined) r.telefono = normalizarTelefono(r.telefono);
  if (r.domicilio !== undefined) r.domicilio = limpiar(r.domicilio);
  if (r.localidad !== undefined) r.localidad = limpiar(r.localidad);
  return r as T;
}
