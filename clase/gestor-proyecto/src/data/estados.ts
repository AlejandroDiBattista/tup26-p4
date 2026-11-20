import type { Estado, EstadoTarea } from './types'

// Comprueba si el estado de destino es contiguo al actual.
export function estadoPermitido(
  actual: EstadoTarea,
  destino: EstadoTarea,
  estados: Estado[],
): boolean {
  const origen = estados.findIndex((estado) => estado.id === actual)
  const siguiente = estados.findIndex((estado) => estado.id === destino)
  return origen !== -1 && siguiente !== -1 && Math.abs(origen - siguiente) <= 1
}

// El responsable solo puede faltar en el primer estado del flujo.
export function responsableRequerido(estado: EstadoTarea, estados: Estado[]): boolean {
  return estados.length > 0 && estado !== estados[0].id
}

// Permite volver al primer estado sin responsable, además de los movimientos contiguos.
export function movimientoPermitido(
  actual: EstadoTarea,
  destino: EstadoTarea,
  estados: Estado[],
  responsableId: string | null,
): boolean {
  return (
    estadoPermitido(actual, destino, estados) ||
    (!responsableId && estados.some((estado) => estado.id === actual) && destino === estados[0]?.id)
  )
}

export const coloresEstado = [
  '#f1f3f5',
  '#eaf3ff',
  '#ecf9f0',
  '#fff5e9',
  '#f6edff',
  '#fff0f1',
  '#e9f8f8',
  '#f6f5e8',
]
// Obtiene un color válido para el estado.
export function colorEstado(estado: Estado, indice: number): string {
  return estado.color && /^#[0-9a-f]{6}$/i.test(estado.color)
    ? estado.color
    : coloresEstado[indice % coloresEstado.length]
}
