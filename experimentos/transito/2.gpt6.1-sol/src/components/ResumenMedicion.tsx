import { calcularFlujo, formatearFlujo } from '@/lib/medicion'

type Props = {
  total: number
  tiempoMs: number
}

export function ResumenMedicion({ total, tiempoMs }: Props) {
  return (
    <footer className="space-y-4 border-t border-stone-300 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-widest text-stone-500">Total registrado</h2>
          <p className="mt-1"><span className="font-mono text-3xl tabular-nums">{total}</span> <span className="text-sm text-stone-500">{total === 1 ? 'vehículo' : 'vehículos'}</span></p>
        </div>
        <div className="text-right">
          <h2 className="text-xs font-medium uppercase tracking-widest text-stone-500">Flujo total</h2>
          <p className="mt-1"><span className="font-mono text-3xl tabular-nums">{formatearFlujo(calcularFlujo(total, tiempoMs))}</span> <span className="text-sm text-stone-500">v/h</span></p>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-stone-500">
        v/h = vehículos por hora. Promedio estimado: cantidad × 3600 ÷ segundos medidos.
        Las pausas no cuentan. El flujo aparece después del primer segundo.
      </p>
    </footer>
  )
}
