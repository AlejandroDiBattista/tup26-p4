import { Clock3, Pause, Play, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatTime } from "@/lib/format-time"

type TimerCardProps = {
  seconds: number
  running: boolean
  onToggle: () => void
  onReset: () => void
}

export function TimerCard({ seconds, running, onToggle, onReset }: TimerCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Tiempo de observación</p>
          <div className="mt-2 font-mono text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">{formatTime(seconds)}</div>
        </div>
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Clock3 className="size-6" /></div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button className="h-11 rounded-xl px-5" onClick={onToggle}>
          {running ? <><Pause className="size-4" /> Pausar</> : <><Play className="size-4" /> {seconds > 0 ? "Continuar" : "Iniciar conteo"}</>}
        </Button>
        <Button variant="outline" className="h-11 rounded-xl px-4" onClick={onReset}><RotateCcw className="size-4" /> Reiniciar</Button>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-400">Iniciá el cronómetro al comenzar la observación y pausalo si necesitás interrumpirla.</p>
    </section>
  )
}
