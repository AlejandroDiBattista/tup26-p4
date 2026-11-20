/** Recorta los extremos y colapsa los espacios internos. */
export function recortar(valor: string): string {
  return valor.trim().replace(/\s+/g, ' ')
}

/** Nombres y apellidos con la inicial de cada palabra en mayuscula. */
export function normalizarNombre(valor: string): string {
  return recortar(valor)
    .toLowerCase()
    .replace(/(^|[\s'’\-.])(\p{L})/gu, (_, sep: string, letra: string) => sep + letra.toUpperCase())
}

/** Email sin espacios y en minusculas. */
export function normalizarEmail(valor: string): string {
  return valor.trim().toLowerCase()
}

/** Telefono: solo digitos, conservando el + inicial si lo traia. */
export function normalizarTelefono(valor: string): string {
  const digitos = valor.replace(/\D/g, '')
  return valor.trim().startsWith('+') ? `+${digitos}` : digitos
}

/** Campo opcional: si queda vacio despues de normalizar, se guarda como null. */
export function normalizarOpcional(
  valor: string | null | undefined,
  normalizar: (valor: string) => string,
): string | null {
  if (valor === null || valor === undefined) return null
  const limpio = normalizar(valor)
  return limpio === '' ? null : limpio
}

/** Texto de busqueda: sin espacios sobrantes y en minusculas. */
export function normalizarBusqueda(valor: string): string {
  return recortar(valor).toLowerCase()
}

/** Fecha ISO de hoy (aaaa-mm-dd) en hora local. */
export function hoyISO(): string {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

/** Minusculas y sin tildes. Igual que la funcion sin_acentos() de SQLite. */
export function sinAcentos(valor: string): string {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}
