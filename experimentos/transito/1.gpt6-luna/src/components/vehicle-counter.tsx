import { Activity, CarFront, Minus, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Vehicle, VehicleCounts } from "@/types"

const vehicleInfo: Record<Vehicle, { label: string; icon: typeof CarFront; color: string }> = {
  motos: { label: "Motos", icon: Activity, color: "text-amber-600" },
  autos: { label: "Autos", icon: CarFront, color: "text-blue-600" },
  camionetas: { label: "Camionetas", icon: Truck, color: "text-violet-600" },
}

type VehicleCounterProps = {
  counts: VehicleCounts
  onChange: (vehicle: Vehicle, amount: number) => void
}

export function VehicleCounter({ counts, onChange }: VehicleCounterProps) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)

  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <div><h2 className="text-lg font-semibold">Vehículos contabilizados</h2><p className="mt-1 text-sm text-slate-500">Tocá el botón cada vez que pase uno.</p></div>
        <div className="text-right"><span className="block text-2xl font-bold tabular-nums">{total}</span><span className="text-xs text-slate-500">total</span></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(vehicleInfo) as Vehicle[]).map((vehicle) => {
          const { label, icon: Icon, color } = vehicleInfo[vehicle]
          return (
            <article key={vehicle} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <div className={`grid size-11 place-items-center rounded-2xl bg-slate-50 ${color}`}><Icon className="size-5" /></div>
                <span className="font-mono text-4xl font-semibold tabular-nums">{counts[vehicle]}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold">{label}</h3>
              <div className="mt-4 flex gap-2">
                <Button aria-label={`Restar un vehículo: ${label}`} variant="outline" className="size-11 rounded-xl" onClick={() => onChange(vehicle, -1)} disabled={counts[vehicle] === 0}><Minus className="size-4" /></Button>
                <Button className="h-11 flex-1 rounded-xl" onClick={() => onChange(vehicle, 1)}><span className="text-lg leading-none">+</span> Agregar</Button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
