import { Activity } from "lucide-react"
import { formatTime } from "@/lib/format-time"

type FlowCardProps = { flow: number; total: number; seconds: number }

export function FlowCard({ flow, total, seconds }: FlowCardProps) {
  return (
    <section className="flex flex-col justify-between rounded-3xl bg-blue-700 p-6 text-white shadow-sm sm:p-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-blue-100">Flujo vehicular estimado</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tight tabular-nums sm:text-6xl">{flow.toLocaleString("es-AR")}</span>
            <span className="text-base font-medium text-blue-100">v/h</span>
          </div>
        </div>
        <Activity className="mt-1 size-6 text-blue-200" />
      </div>
      <div className="mt-7 border-t border-blue-500/70 pt-4 text-sm text-blue-100">
        {seconds === 0 ? "El flujo aparecerá al iniciar el conteo." : `${total} vehículos registrados durante ${formatTime(seconds)}.`}
      </div>
    </section>
  )
}
