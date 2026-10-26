import { useState } from 'react'
import { Cabecera } from '@/components/Cabecera'
import { PuntoObservacion } from '@/components/PuntoObservacion'
import { ControlMedicion } from '@/components/ControlMedicion'
import { RegistroVehiculos } from '@/components/RegistroVehiculos'
import { ResumenMedicion } from '@/components/ResumenMedicion'
import { useCronometro } from '@/hooks/useCronometro'
import type { Categoria, Conteos } from '@/types/medicion'

const conteoInicial: Conteos = { motos: 0, autos: 0, camionetas: 0 }

export default function App() {
  const [punto, setPunto] = useState('')
  const [conteos, setConteos] = useState(conteoInicial)
  const cronometro = useCronometro()
  const total = conteos.motos + conteos.autos + conteos.camionetas

  function cambiarConteo(categoria: Categoria, cambio: number) {
    if (cambio > 0 && !cronometro.activo) return
    setConteos((actual) => ({ ...actual, [categoria]: Math.max(0, actual[categoria] + cambio) }))
  }

  function nuevaMedicion() {
    cronometro.reiniciar()
    setConteos(conteoInicial)
  }

  return (
    <main className="min-h-svh bg-stone-100 px-4 py-5 text-stone-900 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
        <Cabecera activo={cronometro.activo} iniciado={cronometro.iniciado} />
        <PuntoObservacion valor={punto} onCambiar={setPunto} />
        <ControlMedicion
          tiempoMs={cronometro.tiempoMs}
          activo={cronometro.activo}
          iniciado={cronometro.iniciado}
          onAlternar={cronometro.alternar}
          onNuevaMedicion={nuevaMedicion}
        />
        <RegistroVehiculos
          conteos={conteos}
          tiempoMs={cronometro.tiempoMs}
          activo={cronometro.activo}
          iniciado={cronometro.iniciado}
          onCambiar={cambiarConteo}
        />
        <ResumenMedicion total={total} tiempoMs={cronometro.tiempoMs} />
      </div>
    </main>
  )
}
