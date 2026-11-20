import { useEffect, useMemo, useState } from "react"
import { AppHeader } from "@/components/app-header"
import { FlowCard } from "@/components/flow-card"
import { LocationField } from "@/components/location-field"
import { TimerCard } from "@/components/timer-card"
import { VehicleCounter } from "@/components/vehicle-counter"
import { initialCounts, type Vehicle, type VehicleCounts } from "@/types"

export default function App() {
  const [counts, setCounts] = useState<VehicleCounts>(initialCounts)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [location, setLocation] = useState("")
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
  const flow = useMemo(() => (seconds > 0 ? Math.round((total * 3600) / seconds) : 0), [seconds, total])

  useEffect(() => {
    if (!running) return
    const interval = window.setInterval(() => setSeconds((current) => current + 1), 1000)
    return () => window.clearInterval(interval)
  }, [running])

  function changeVehicleCount(vehicle: Vehicle, amount: number) {
    setCounts((current) => ({ ...current, [vehicle]: Math.max(0, current[vehicle] + amount) }))
  }

  function resetCount() {
    setRunning(false)
    setSeconds(0)
    setCounts({ ...initialCounts })
  }

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-4 py-6 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <AppHeader running={running} seconds={seconds} />
        <section className="mb-5 grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
          <TimerCard seconds={seconds} running={running} onToggle={() => setRunning((value) => !value)} onReset={resetCount} />
          <FlowCard flow={flow} total={total} seconds={seconds} />
        </section>
        <LocationField value={location} onChange={setLocation} />
        <VehicleCounter counts={counts} onChange={changeVehicleCount} />
        <footer className="mt-6 text-center text-xs text-slate-400">Flujo = vehículos registrados ÷ tiempo transcurrido × 60 minutos</footer>
      </div>
    </main>
  )
}
