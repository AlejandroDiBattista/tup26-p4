import { Activity } from "lucide-react"

type AppHeaderProps = { running: boolean; seconds: number }

export function AppHeader({ running, seconds }: AppHeaderProps) {
  const status = running ? "Conteo en curso" : seconds > 0 ? "Conteo pausado" : "Listo para comenzar"

  return (
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
          <span className="grid size-8 place-items-center rounded-xl bg-blue-100"><Activity className="size-4" /></span>
          Aforo urbano
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Conteo de tránsito</h1>
        <p className="mt-2 text-slate-500">Registrá los vehículos que pasan por un punto de la ciudad.</p>
      </div>
      <div className="flex items-center gap-2 self-start rounded-full border bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm sm:self-auto">
        <span className={`size-2 rounded-full ${running ? "animate-pulse bg-emerald-500" : "bg-slate-300"}`} />
        {status}
      </div>
    </header>
  )
}
