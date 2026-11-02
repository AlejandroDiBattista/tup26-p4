import { useState } from 'react'
import Contador from './Contador'
import Cronometro from './Cronometro'
import Resultado from './Resultado'
import Sesiones from './Sesiones'
import { useContadorStore } from '../store/contadorStore'
import type { SesionMuestreo } from '../hooks/sesiones'
import './Listar.css'

function Listar() {
  const [sesionPrevisualizada, setSesionPrevisualizada] = useState<SesionMuestreo | null>(null)
  const vehiculos = useContadorStore((state) => state.vehiculos)
  const cuentasActuales = useContadorStore((state) => state.cuentas)
  const totalActual = useContadorStore((state) => state.total)
  const segundosActuales = useContadorStore((state) => (
    sesionPrevisualizada === null ? Math.floor(state.segundosFuncionamiento) : 0
  ))
  const cuentas = sesionPrevisualizada?.cuentas ?? cuentasActuales
  const total = sesionPrevisualizada?.total ?? totalActual
  const segundosFuncionamiento = sesionPrevisualizada?.segundosFuncionamiento ?? segundosActuales
  const vistaPrevia = sesionPrevisualizada !== null
  const flujo = segundosFuncionamiento > 0
    ? (total * 3600) / segundosFuncionamiento
    : 0
  let inicioPorcentaje = 0
  const distribucion = vehiculos.map((vehiculo) => {
    const cuenta = cuentas[vehiculo.etiqueta] ?? 0
    const porcentaje = total > 0 ? (cuenta / total) * 100 : 0
    const inicio = inicioPorcentaje
    inicioPorcentaje += porcentaje

    return { ...vehiculo, porcentaje, inicio }
  })

  return (
    <section className="resumen-contadores">
      <Cronometro tiempoVista={sesionPrevisualizada?.tiempoTranscurrido ?? 0} vistaPrevia={vistaPrevia} />
      <ul className="lista-contadores" aria-label="Contadores de vehículos">
        {vehiculos.map((vehiculo) => (
          <li key={vehiculo.etiqueta}>
            <Contador
              etiqueta={vehiculo.etiqueta}
              icono={vehiculo.icono}
              color={vehiculo.color}
              cuenta={cuentas[vehiculo.etiqueta] ?? 0}
              vistaPrevia={vistaPrevia}
            />
          </li>
        ))}
      </ul>
      <div className="resultados-contadores">
        <Resultado etiqueta="Total" valor={total} />
        <Resultado etiqueta="Flujo" valor={`${Math.round(flujo)} v/h`} />
      </div>
      <section className="distribucion-contadores" aria-label="Distribución de vehículos">
        <div className="barra-distribucion-con-iconos">
          <div className="barra-distribucion" role="img" aria-label="Distribución porcentual de vehículos">
            {distribucion.filter((vehiculo) => vehiculo.porcentaje > 0).map((vehiculo) => (
              <span
                key={vehiculo.etiqueta}
                className="segmento-distribucion"
                title={`${vehiculo.etiqueta}: ${vehiculo.porcentaje.toFixed(1)}%`}
                style={{
                  width: `${vehiculo.porcentaje}%`,
                  backgroundColor: `color-mix(in oklch, ${vehiculo.color} 56%, white)`,
                }}
              />
            ))}
          </div>
          <div className="iconos-distribucion" aria-hidden="true">
            {distribucion.filter((vehiculo) => vehiculo.porcentaje > 0).map((vehiculo) => (
              <span
                key={vehiculo.etiqueta}
                className="icono-distribucion"
                style={{ left: `${vehiculo.inicio + vehiculo.porcentaje / 2}%` }}
              >
                {vehiculo.icono}
              </span>
            ))}
          </div>
        </div>
      </section>
      <Sesiones onPrevisualizar={setSesionPrevisualizada} />
    </section>
  )
}

export default Listar
