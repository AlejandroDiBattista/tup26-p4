import { DURACION_OBSERVACION_MS } from '../store/constants'
import { useContadorStore } from '../store/contadorStore'
import type { Store } from '../store/types'

const CLAVE_SESIONES = 'contador-vehiculos-sesiones-v1'

export type SesionMuestreo = {
  id: string
  nombre: string
  guardadaEn: string
  cuentas: Store['cuentas']
  total: number
  tiempoTranscurrido: number
  segundosFuncionamiento: number
}

export function leerSesiones(): SesionMuestreo[] {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESIONES) ?? '[]') as SesionMuestreo[]
  } catch {
    return []
  }
}

export function guardarSesiones(sesiones: SesionMuestreo[]) {
  try {
    localStorage.setItem(CLAVE_SESIONES, JSON.stringify(sesiones))
  } catch {
    // La app sigue funcionando aunque el navegador no permita usar localStorage.
  }
}

export function borrarSesion(id: string, sesiones: SesionMuestreo[]) {
  const nuevasSesiones = sesiones.filter((sesion) => sesion.id !== id)
  guardarSesiones(nuevasSesiones)
  return nuevasSesiones
}

export function guardarSesion(nombre: string, sesiones: SesionMuestreo[]) {
  const estado = useContadorStore.getState()
  const sesion: SesionMuestreo = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    nombre,
    guardadaEn: new Date().toISOString(),
    cuentas: estado.cuentas,
    total: estado.total,
    tiempoTranscurrido: estado.tiempoTranscurrido,
    segundosFuncionamiento: estado.segundosFuncionamiento,
  }
  const nuevasSesiones = [sesion, ...sesiones]
  guardarSesiones(nuevasSesiones)
  return nuevasSesiones
}

export function cargarSesion(sesion: SesionMuestreo) {
  const tiempoTranscurrido = Math.min(sesion.tiempoTranscurrido, DURACION_OBSERVACION_MS)
  useContadorStore.setState({
    cuentas: sesion.cuentas,
    total: sesion.total,
    tiempoTranscurrido,
    segundosFuncionamiento: tiempoTranscurrido / 1000,
    iniciadoEn: null,
    estadoCronometro: 'detenido',
  })
}
