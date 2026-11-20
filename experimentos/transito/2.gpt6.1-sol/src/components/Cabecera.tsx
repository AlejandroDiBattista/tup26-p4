type Props = {
  activo: boolean
  iniciado: boolean
}

export function Cabecera({ activo, iniciado }: Props) {
  const estado = activo ? 'Midiendo' : iniciado ? 'En pausa' : 'Sin iniciar'

  return (
    <header className="space-y-3 sm:space-y-4 sm:pb-2">
      <div className="flex items-center justify-between gap-4 border-b border-stone-300 pb-3 sm:pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em]">Aforo urbano</p>
        <span className="flex items-center gap-2 text-sm text-stone-600" role="status">
          <span className={`size-2 rounded-full ${activo ? 'bg-emerald-700' : 'bg-stone-400'}`} aria-hidden="true" />
          {estado}
        </span>
      </div>
      <h1 className="font-serif text-3xl tracking-tight sm:text-5xl">Contá el tránsito.</h1>
      <p className="max-w-xl text-sm leading-relaxed text-stone-600 sm:text-base">
        Un toque por vehículo. El flujo se calcula en tiempo real.
      </p>
    </header>
  )
}
