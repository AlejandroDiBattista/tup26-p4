import { CarFront, Minus, Motorbike, Plus, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DatosCategoria } from '@/lib/categorias'
import { mostrarFlujo, mostrarNumero } from '@/lib/formato'

const iconos = { motos: Motorbike, autos: CarFront, camionetas: Truck }

type ContadorVehiculoProps = {
  categoria: DatosCategoria
  cantidad: number
  tiempo: number
  activo: boolean
  onSumar: () => void
  onRestar: () => void
}

export function ContadorVehiculo({ categoria, cantidad, tiempo, activo, onSumar, onRestar }: ContadorVehiculoProps) {
  const { id, nombre, singular, tecla } = categoria
  const Icono = iconos[id]

  return (
    <article className={`counter counter-${id}`}>
      <div className="counter-heading"><h3>{nombre}</h3><kbd>{tecla}</kbd></div>
      <div className="counter-reading">
        <span className="count">{mostrarNumero(cantidad)}</span>
        <Icono className="vehicle-icon" aria-hidden="true" strokeWidth={1.25} />
      </div>
      <div className="category-flow">
        <span>{mostrarFlujo(cantidad, tiempo)} <small>v/h</small></span>
        <span>flujo estimado</span>
      </div>
      <div className="counter-actions">
        <Button variant="outline" className="subtract-button" aria-label={`Restar ${singular}`} disabled={cantidad === 0} onClick={onRestar}>
          <Minus />
        </Button>
        <Button className="add-button" onClick={onSumar} disabled={!activo} aria-label={`Sumar ${singular}`}>
          <Plus /> Sumar {singular}
        </Button>
      </div>
    </article>
  )
}
