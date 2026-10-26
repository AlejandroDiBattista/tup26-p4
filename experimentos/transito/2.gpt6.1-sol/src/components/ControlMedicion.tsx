import { useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatearTiempo } from '@/lib/medicion'

type Props = {
  tiempoMs: number
  activo: boolean
  iniciado: boolean
  onAlternar: () => void
  onNuevaMedicion: () => void
}

export function ControlMedicion({ tiempoMs, activo, iniciado, onAlternar, onNuevaMedicion }: Props) {
  const [confirmarReinicio, setConfirmarReinicio] = useState(false)

  function alternar() {
    setConfirmarReinicio(false)
    onAlternar()
  }

  function reiniciar() {
    setConfirmarReinicio(false)
    onNuevaMedicion()
  }

  return (
    <Card className="gap-0 rounded-2xl py-0 shadow-none">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-7 sm:py-5">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-widest text-stone-500">Tiempo medido</h2>
          <time
            dateTime={`PT${(tiempoMs / 1000).toFixed(3)}S`}
            className="mt-1 block font-mono text-3xl font-medium tracking-tight tabular-nums sm:text-4xl"
          >
            {formatearTiempo(tiempoMs)}
          </time>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="h-11 min-w-24 bg-emerald-800 text-white hover:bg-emerald-900 sm:min-w-32"
            onClick={alternar}
          >
            {activo ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            {activo ? 'Pausar' : iniciado ? 'Continuar' : 'Iniciar'}
          </Button>
          <Button
            variant="outline"
            className="size-11 sm:w-auto"
            aria-label="Nueva medición"
            disabled={activo || !iniciado}
            onClick={() => setConfirmarReinicio(true)}
          >
            <RotateCcw aria-hidden="true" /> <span className="hidden sm:inline">Nueva medición</span>
          </Button>
        </div>
      </CardContent>
      {confirmarReinicio && (
        <div className="space-y-3 border-t border-stone-200 bg-stone-50 px-5 py-4 sm:px-7">
          <p className="text-sm">Se borrarán los conteos y el tiempo. ¿Comenzar una nueva medición?</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="h-11" onClick={() => setConfirmarReinicio(false)}>Cancelar</Button>
            <Button className="h-11" onClick={reiniciar}>Reiniciar medición</Button>
          </div>
        </div>
      )}
    </Card>
  )
}
