import type { CSSProperties } from 'react'
import { useContadorStore } from '../store/contadorStore'
import './Contador.css'

type ContadorProps = {
  etiqueta: string
  icono: string
  color: string
  cuenta: number
  vistaPrevia: boolean
}

function Contador({ etiqueta, icono, color, cuenta, vistaPrevia }: ContadorProps) {
  const incrementar = useContadorStore((state) => state.incrementar)
  const cronometroPrendido = useContadorStore((state) => state.estadoCronometro === 'corriendo')

  return (
    <button
      className="counter"
      type="button"
      style={{ '--color-vehiculo': color } as CSSProperties}
      disabled={vistaPrevia || !cronometroPrendido}
      onClick={() => incrementar(etiqueta)}
    >
      <span className="counter-icon" aria-hidden="true">{icono}</span>
      <span className="counter-label">{etiqueta}</span>
      <span className="counter-value">{cuenta}</span>
    </button>
  )
}

export default Contador
