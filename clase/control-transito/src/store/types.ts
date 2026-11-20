export type Vehiculo = {
  etiqueta: string
  icono: string
  color: string
}

export type ContadoresSlice = {
  vehiculos: Vehiculo[]
  cuentas: Record<string, number>
  total: number
  incrementar: (etiqueta: string) => void
  reiniciarContadores: () => void
}

export type CronometroSlice = {
  tiempoTranscurrido: number
  segundosFuncionamiento: number
  iniciadoEn: number | null
  estadoCronometro: 'detenido' | 'pausado' | 'corriendo'
  prender: () => void
  pausar: () => void
  parar: () => void
  reiniciar: () => void
  actualizar: () => void
}

export type Store = ContadoresSlice & CronometroSlice & {
  reiniciarTodo: () => void
}
