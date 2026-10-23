import { flujoPorHora } from './transito'

const numero = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })

export function mostrarNumero(valor: number): string {
  return numero.format(valor)
}

export function mostrarFlujo(cantidad: number, tiempo: number): string {
  const flujo = flujoPorHora(cantidad, tiempo)
  return flujo === null ? '—' : mostrarNumero(flujo)
}
