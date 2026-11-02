import { useEffect } from 'react'
import { DURACION_OBSERVACION_MS } from '../store/constants'
import { useContadorStore } from '../store/contadorStore'
import type { Store } from '../store/types'

const CLAVE_STORAGE = 'contador-vehiculos-v1'
const DEMORA_GUARDADO_MS = 300

type DatosPersistidos = Pick<Store, 'cuentas' | 'total' | 'tiempoTranscurrido' | 'segundosFuncionamiento' | 'estadoCronometro'>

function leerDatos(): Partial<DatosPersistidos> | null {
  try {
    const guardado = localStorage.getItem(CLAVE_STORAGE)
    if (!guardado) return null

    const datos = JSON.parse(guardado) as DatosPersistidos
    const tiempoTranscurrido = Math.min(datos.tiempoTranscurrido, DURACION_OBSERVACION_MS)

    return {
      cuentas: datos.cuentas,
      total: Object.values(datos.cuentas).reduce((suma, cuenta) => suma + cuenta, 0),
      tiempoTranscurrido,
      segundosFuncionamiento: tiempoTranscurrido / 1000,
      estadoCronometro: tiempoTranscurrido >= DURACION_OBSERVACION_MS
        ? 'detenido'
        : datos.estadoCronometro === 'corriendo' ? 'pausado' : datos.estadoCronometro,
    }
  } catch {
    return null
  }
}

function guardarDatos(datos: DatosPersistidos) {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(datos))
  } catch {
    // La app sigue funcionando aunque el navegador no permita usar localStorage.
  }
}

function usePersistenciaLocalStorage() {
  useEffect(() => {
    const datosGuardados = leerDatos()
    if (datosGuardados) useContadorStore.setState(datosGuardados)

    let demoraGuardado: number | undefined
    const guardarEstado = (estado: Store) => {
      if (demoraGuardado !== undefined) window.clearTimeout(demoraGuardado)
      demoraGuardado = window.setTimeout(() => {
        const { cuentas, total, tiempoTranscurrido, segundosFuncionamiento, estadoCronometro } = estado
        guardarDatos({ cuentas, total, tiempoTranscurrido, segundosFuncionamiento, estadoCronometro })
      }, DEMORA_GUARDADO_MS)
    }

    const desuscribir = useContadorStore.subscribe(guardarEstado)
    const guardarAlSalir = () => guardarEstado(useContadorStore.getState())
    window.addEventListener('pagehide', guardarAlSalir)

    return () => {
      desuscribir()
      window.removeEventListener('pagehide', guardarAlSalir)
      if (demoraGuardado !== undefined) window.clearTimeout(demoraGuardado)
    }
  }, [])
}

export default usePersistenciaLocalStorage
