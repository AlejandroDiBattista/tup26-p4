import { useState } from 'react'

// Normaliza el texto para comparar sin tildes ni mayúsculas.
function normalizar(valor: string) {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim()
}

// Filtra una lista sin distinguir mayúsculas ni tildes.
export function useBusqueda<T>(elementos: T[], texto: (elemento: T) => string) {
  const [busqueda, setBusqueda] = useState('')
  const consulta = normalizar(busqueda)
  const resultados = elementos.filter((elemento) => normalizar(texto(elemento)).includes(consulta))

  return { busqueda, setBusqueda, resultados }
}
