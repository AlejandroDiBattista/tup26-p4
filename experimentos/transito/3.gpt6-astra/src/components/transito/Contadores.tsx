import { ContadorVehiculo } from './ContadorVehiculo'
import { categorias } from '@/lib/categorias'
import type { Categoria, Conteo } from '@/lib/transito'

type ContadoresProps = {
  cantidades: Conteo['cantidades']
  tiempo: number
  activo: boolean
  onSumar: (categoria: Categoria) => void
  onRestar: (categoria: Categoria) => void
}

export function Contadores({ cantidades, tiempo, activo, onSumar, onRestar }: ContadoresProps) {
  return (
    <>
      <div className="section-label">
        <h2>Registrá el paso</h2>
        <span>{activo ? 'Un toque = un vehículo' : 'Iniciá o continuá el reloj para contar'}</span>
      </div>
      <section className="counters" aria-label="Contadores por categoría">
        {categorias.map((categoria) => (
          <ContadorVehiculo
            key={categoria.id}
            categoria={categoria}
            cantidad={cantidades[categoria.id]}
            tiempo={tiempo}
            activo={activo}
            onSumar={() => onSumar(categoria.id)}
            onRestar={() => onRestar(categoria.id)}
          />
        ))}
      </section>
    </>
  )
}
