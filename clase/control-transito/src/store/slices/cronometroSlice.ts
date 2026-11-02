import type { StateCreator } from 'zustand'
import type { CronometroSlice, Store } from '../types'
import { DURACION_OBSERVACION_MS } from '../constants'

export const crearCronometroSlice: StateCreator< Store, [], [], CronometroSlice > = (set) => ({
  tiempoTranscurrido: 0,
  segundosFuncionamiento: 0,
  iniciadoEn: null,
  estadoCronometro: 'detenido',
  
  prender: () =>
    set((state) => state.estadoCronometro === 'corriendo' || state.tiempoTranscurrido >= DURACION_OBSERVACION_MS
      ? state
      : { iniciadoEn: Date.now(), estadoCronometro: 'corriendo' }),
  
  pausar: () =>
    set((state) => {
      if (state.estadoCronometro !== 'corriendo' || state.iniciadoEn === null) return state
      const tiempoTranscurrido = Math.min(
        state.tiempoTranscurrido + Date.now() - state.iniciadoEn,
        DURACION_OBSERVACION_MS,
      )
      return {
        tiempoTranscurrido,
        segundosFuncionamiento: tiempoTranscurrido / 1000,
        iniciadoEn: null,
        estadoCronometro: tiempoTranscurrido >= DURACION_OBSERVACION_MS ? 'detenido' : 'pausado',
      }
    }),
  
  parar: () =>
    set((state) => {
      if (state.estadoCronometro !== 'corriendo' || state.iniciadoEn === null) {
        return { iniciadoEn: null, estadoCronometro: 'detenido' }
      }
      const tiempoTranscurrido = Math.min(
        state.tiempoTranscurrido + Date.now() - state.iniciadoEn,
        DURACION_OBSERVACION_MS,
      )
      return {
        tiempoTranscurrido,
        segundosFuncionamiento: tiempoTranscurrido / 1000,
        iniciadoEn: null,
        estadoCronometro: 'detenido',
      }
    }),

  reiniciar: () =>
    set({ tiempoTranscurrido: 0, segundosFuncionamiento: 0, iniciadoEn: null, estadoCronometro: 'detenido' }),
  
  actualizar: () =>
    set((state) => {
      if (state.estadoCronometro !== 'corriendo' || state.iniciadoEn === null) return state
      const ahora = Date.now()
      const tiempoAcumulado = state.tiempoTranscurrido + ahora - state.iniciadoEn
      const tiempoTranscurrido = Math.min(
        Math.floor(tiempoAcumulado / 100) * 100,
        DURACION_OBSERVACION_MS,
      )
      const finalizado = tiempoTranscurrido >= DURACION_OBSERVACION_MS
      const residuo = tiempoAcumulado - tiempoTranscurrido
      return {
        tiempoTranscurrido,
        segundosFuncionamiento: tiempoTranscurrido / 1000,
        iniciadoEn: finalizado ? null : ahora - residuo,
        estadoCronometro: finalizado ? 'detenido' : 'corriendo',
      }
    }),
})
