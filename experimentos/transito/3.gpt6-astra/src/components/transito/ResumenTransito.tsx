import { ArrowUpRight } from 'lucide-react'
import { categorias } from '@/lib/categorias'
import { mostrarFlujo, mostrarNumero } from '@/lib/formato'
import type { Conteo } from '@/lib/transito'

type ResumenTransitoProps = {
  cantidades: Conteo['cantidades']
  total: number
  tiempo: number
}

export function ResumenTransito({ cantidades, total, tiempo }: ResumenTransitoProps) {
  return (
    <>
      <section className="results" aria-label="Resumen del tránsito">
        <div className="flow-result">
          <div className="result-label">FLUJO TOTAL ESTIMADO <ArrowUpRight aria-hidden="true" /></div>
          <p><strong>{mostrarFlujo(total, tiempo)}</strong><span>v/h</span></p>
          <span>Vehículos por hora de observación</span>
        </div>
        <div className="total-result">
          <span className="field-label">TOTAL REGISTRADO</span>
          <p>{mostrarNumero(total)} <span>vehículos</span></p>
          <div className="distribution" aria-hidden="true">
            {categorias.map(({ id }) => (
              <span key={id} className={`segment-${id}`} style={{ flexGrow: cantidades[id] }} />
            ))}
          </div>
          <div className="legend">
            {categorias.map(({ id, nombre }) => (
              <span key={id}>
                <i className={`segment-${id}`} />{nombre}
                <b>{total ? Math.round(cantidades[id] / total * 100) : 0}%</b>
              </span>
            ))}
          </div>
        </div>
      </section>
      <p className="flow-note">
        Flujo = vehículos ÷ segundos observados × 3.600. Es una proyección del conteo;
        se vuelve más representativa con más tiempo de observación.
      </p>
    </>
  )
}
