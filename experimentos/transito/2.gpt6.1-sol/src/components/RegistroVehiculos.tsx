import { CarFront, Motorbike, Truck } from 'lucide-react'
import { ContadorVehiculo } from '@/components/ContadorVehiculo'
import { Card } from '@/components/ui/card'
import { calcularFlujo } from '@/lib/medicion'
import type { Categoria, Conteos } from '@/types/medicion'

const categorias = [
  { id: 'motos', nombre: 'Motos', Icono: Motorbike },
  { id: 'autos', nombre: 'Autos', Icono: CarFront },
  { id: 'camionetas', nombre: 'Camionetas', Icono: Truck },
] as const

type Props = {
  conteos: Conteos
  tiempoMs: number
  activo: boolean
  iniciado: boolean
  onCambiar: (categoria: Categoria, cambio: number) => void
}

export function RegistroVehiculos({ conteos, tiempoMs, activo, iniciado, onCambiar }: Props) {
  const mensaje = activo
    ? 'Medición en curso. Registrá cada vehículo una sola vez.'
    : iniciado
      ? 'El cronómetro está pausado. Podés corregir los conteos o continuar.'
      : 'Los botones para sumar se habilitan al iniciar la medición.'

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3 px-1">
        <h2 className="text-base font-semibold">Registro de vehículos</h2>
        <p className="text-xs text-stone-500">+ para contar · − para corregir</p>
      </div>
      <Card className="gap-0 rounded-2xl py-0 shadow-none">
        <ul>
          {categorias.map(({ id, nombre, Icono }) => (
            <ContadorVehiculo
              key={id}
              nombre={nombre}
              Icono={Icono}
              cantidad={conteos[id]}
              flujo={calcularFlujo(conteos[id], tiempoMs)}
              activo={activo}
              onCambiar={(cambio) => onCambiar(id, cambio)}
            />
          ))}
        </ul>
      </Card>
      <p className="px-1 text-xs leading-relaxed text-stone-500">{mensaje}</p>
    </section>
  )
}
