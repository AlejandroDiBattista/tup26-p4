import type { LucideIcon } from 'lucide-react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatearFlujo } from '@/lib/medicion'

type Props = {
  nombre: string
  Icono: LucideIcon
  cantidad: number
  flujo: number | null
  activo: boolean
  onCambiar: (cambio: number) => void
}

export function ContadorVehiculo({ nombre, Icono, cantidad, flujo, activo, onCambiar }: Props) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_4rem_auto] items-center gap-x-2 border-b border-stone-200 px-4 py-4 last:border-0 sm:grid-cols-[minmax(0,1fr)_16rem_auto] sm:gap-x-6 sm:px-7 sm:py-5">
      <div className="flex min-w-0 items-center gap-3">
        <Icono className="hidden size-6 shrink-0 text-stone-500 sm:block" aria-hidden="true" />
        <h3 className="text-sm font-semibold sm:text-lg">{nombre}</h3>
      </div>
      <div className="space-y-1 text-right sm:grid sm:grid-cols-2 sm:items-center sm:space-y-0">
        <p>
          <span className="font-mono text-2xl font-medium tabular-nums sm:text-3xl" aria-live="polite" aria-atomic="true">
            <span className="sr-only">{nombre}: </span>{cantidad}
          </span>
          <span className="sr-only text-xs text-stone-500 sm:not-sr-only sm:mt-1 sm:block">{cantidad === 1 ? 'vehículo' : 'vehículos'}</span>
        </p>
        <p className="text-stone-600">
          <span className="font-mono text-sm font-medium tabular-nums sm:text-lg">{formatearFlujo(flujo)}</span>
          <span className="ml-1 text-[10px] sm:mt-1 sm:ml-0 sm:block sm:text-xs">v/h</span>
        </p>
      </div>
      <div className="flex gap-1 sm:gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-10 touch-manipulation rounded-full sm:size-11"
          aria-label={`Restar ${nombre.toLowerCase()}`}
          disabled={cantidad === 0}
          onClick={() => onCambiar(-1)}
        >
          <Minus aria-hidden="true" />
        </Button>
        <Button
          size="icon"
          className="size-11 touch-manipulation rounded-full bg-emerald-800 text-white hover:bg-emerald-900 sm:size-12"
          aria-label={`Sumar ${nombre.toLowerCase()}`}
          disabled={!activo}
          onClick={() => onCambiar(1)}
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>
    </li>
  )
}
