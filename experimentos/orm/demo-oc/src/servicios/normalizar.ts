/** Recorta extremos y colapsa espacios internos: "  Ana   Gómez " -> "Ana Gómez". */
export function recortar(valor: string): string {
  return valor.trim().replace(/\s+/g, " ");
}

/** Nombre o apellido en Title Case: "  juan  PÉREZ " -> "Juan Pérez". */
export function normalizarNombre(valor: string): string {
  return recortar(valor)
    .toLowerCase()
    .replace(/(^|[\s'’\-.])(\p{L})/gu, (_, separador: string, letra: string) => separador + letra.toUpperCase());
}

/** Email en minúsculas y sin espacios. */
export function normalizarEmail(valor: string): string {
  return valor.trim().toLowerCase();
}

/** Solo dígitos, conservando el "+" inicial: "+54 11 5555-1001" -> "+541155551001". */
export function normalizarTelefono(valor: string): string {
  const digitos = valor.replace(/\D/g, "");
  return valor.trim().startsWith("+") ? `+${digitos}` : digitos;
}

/**
 * Normaliza un campo opcional. Un valor vacío se guarda como `null`
 * en lugar de una cadena en blanco.
 */
export function normalizarOpcional(
  valor: string | null | undefined,
  normalizar: (valor: string) => string,
): string | null {
  if (valor === null || valor === undefined) return null;

  const normalizado = normalizar(valor);
  return normalizado === "" ? null : normalizado;
}

/** Término de búsqueda: sin espacios sobrantes y en minúsculas. */
export function normalizarBusqueda(valor: string): string {
  return recortar(valor).toLowerCase();
}
