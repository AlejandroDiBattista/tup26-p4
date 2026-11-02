import type { StateCreator } from 'zustand'
import type { ContadoresSlice, Store, Vehiculo } from '../types'

const vehiculosIniciales: Vehiculo[] = [
  { icono: '🏍️', etiqueta: 'Motos', color: '#7c3aed' },
  { icono: '🚗', etiqueta: 'Autos', color: '#2563eb' },
  { icono: '🛻', etiqueta: 'Camionetas', color: '#0891b2' },
  { icono: '🚚', etiqueta: 'Camiones', color: '#059669' },
  { icono: '🚌', etiqueta: 'Colectivos', color: '#65a30d' },
  { icono: '🚲', etiqueta: 'Bicicletas', color: '#d97706' },
  { icono: '🚜', etiqueta: 'Tractores', color: '#ea580c' },
  { icono: '🚘', etiqueta: 'Otros', color: '#db2777' },
]

export const crearContadoresSlice: StateCreator< Store, [], [], ContadoresSlice > = (set) => ({
  vehiculos: vehiculosIniciales,
  cuentas: {},
  total: 0,

  incrementar: (etiqueta) =>
    set((state) => ({
      cuentas: {
        ...state.cuentas,
        [etiqueta]: (state.cuentas[etiqueta] ?? 0) + 1,
      },
      total: state.total + 1,
    })),
  
  reiniciarContadores: () => set({ cuentas: {}, total: 0 }),
})
