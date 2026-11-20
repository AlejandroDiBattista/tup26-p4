export type Categoria = 'motos' | 'autos' | 'camionetas'
export type Conteo = {
  punto: string
  cantidades: Record<Categoria, number>
  acumuladoMs: number
  enMarchaDesde: number | null
  inicio: number | null
}

export function nuevoConteo(punto = ''): Conteo {
  return { punto, cantidades: { motos: 0, autos: 0, camionetas: 0 }, acumuladoMs: 0, enMarchaDesde: null, inicio: null }
}

export function tiempoObservado(conteo: Conteo, ahora: number): number {
  return conteo.acumuladoMs + (conteo.enMarchaDesde === null ? 0 : Math.max(0, ahora - conteo.enMarchaDesde))
}

export function alternarReloj(conteo: Conteo, ahora: number): Conteo {
  if (conteo.enMarchaDesde !== null) {
    return { ...conteo, acumuladoMs: tiempoObservado(conteo, ahora), enMarchaDesde: null }
  }
  return { ...conteo, inicio: conteo.inicio ?? ahora, enMarchaDesde: ahora }
}

export function contar(conteo: Conteo, categoria: Categoria, cambio: 1 | -1): Conteo {
  if (cambio === 1 && conteo.enMarchaDesde === null) return conteo
  return { ...conteo, cantidades: { ...conteo.cantidades, [categoria]: Math.max(0, conteo.cantidades[categoria] + cambio) } }
}

export function flujoPorHora(cantidad: number, milisegundos: number): number | null {
  return milisegundos < 1000 ? null : cantidad * 3_600_000 / milisegundos
}

export function formatearTiempo(milisegundos: number): string {
  const segundos = Math.floor(milisegundos / 1000)
  return [Math.floor(segundos / 3600), Math.floor(segundos / 60) % 60, segundos % 60]
    .map((valor) => String(valor).padStart(2, '0')).join(':')
}

export function recuperarConteo(texto: string | null): Conteo {
  if (!texto) return nuevoConteo()
  try {
    const dato = JSON.parse(texto)
    const tiempoValido = (valor: unknown): valor is number => typeof valor === 'number' && Number.isFinite(valor) && valor >= 0
    if (typeof dato?.punto !== 'string' || !tiempoValido(dato.acumuladoMs)
      || !(dato.enMarchaDesde === null || tiempoValido(dato.enMarchaDesde))
      || !(dato.inicio === null || tiempoValido(dato.inicio))
      || (dato.enMarchaDesde !== null && dato.inicio === null)
      || !['motos', 'autos', 'camionetas'].every((categoria) => Number.isSafeInteger(dato.cantidades?.[categoria]) && dato.cantidades[categoria] >= 0)) {
      return nuevoConteo()
    }
    return dato as Conteo
  } catch {
    return nuevoConteo()
  }
}
