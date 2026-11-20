const numeros = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })

export function calcularFlujo(cantidad: number, tiempoMs: number): number | null {
  if (tiempoMs < 1000) return null
  return cantidad * 3_600_000 / tiempoMs
}

export function formatearFlujo(flujo: number | null): string {
  return flujo === null ? '—' : numeros.format(flujo)
}

export function formatearTiempo(tiempoMs: number): string {
  const segundos = Math.floor(tiempoMs / 1000)
  return [Math.floor(segundos / 3600), Math.floor(segundos / 60) % 60, segundos % 60]
    .map((valor) => String(valor).padStart(2, '0'))
    .join(':')
}
