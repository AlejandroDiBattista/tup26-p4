import { create } from 'zustand'
import { crearContadoresSlice } from './slices/contadoresSlice'
import { crearCronometroSlice } from './slices/cronometroSlice'
import type { Store } from './types'

export const useContadorStore = create<Store>()((...args) => {
  const [set] = args

  return {
    ...crearContadoresSlice(...args),
    ...crearCronometroSlice(...args),
    reiniciarTodo: () =>
      set({
        cuentas: {},
        total: 0,
        tiempoTranscurrido: 0,
        segundosFuncionamiento: 0,
        iniciadoEn: null,
        estadoCronometro: 'detenido',
      }),
  }
})
