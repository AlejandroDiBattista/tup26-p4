import { MapPin, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatearTiempo } from '@/lib/transito'

type ObservacionProps = {
  punto: string
  tiempo: number
  activo: boolean
  iniciado: boolean
  onCambiarPunto: (punto: string) => void
  onCambiarReloj: () => void
}

export function Observacion({ punto, tiempo, activo, iniciado, onCambiarPunto, onCambiarReloj }: ObservacionProps) {
  const estado = activo ? 'Observación en curso' : iniciado ? 'Observación pausada' : 'Listo para comenzar'
  const accion = activo ? 'Pausar' : iniciado ? 'Continuar' : 'Iniciar conteo'

  return (
    <section className="observation" aria-label="Punto y tiempo de observación">
      <div className="location-field">
        <label htmlFor="punto"><MapPin aria-hidden="true" /> Punto de observación</label>
        <Input
          id="punto"
          aria-describedby="punto-ayuda"
          placeholder="Ej. Av. Aconquija y Camino del Perú"
          value={punto}
          onChange={(evento) => onCambiarPunto(evento.target.value)}
          maxLength={160}
        />
        <span id="punto-ayuda">Una esquina, una avenida o el lugar donde estás contando.</span>
      </div>
      <div className="timer-block">
        <span className="field-label">TIEMPO OBSERVADO</span>
        <div className="timer" role="timer" aria-label="Tiempo observado">{formatearTiempo(tiempo)}</div>
        <span className={`status ${activo ? 'running' : ''}`} role="status"><i />{estado}</span>
      </div>
      <Button className="start-button" onClick={onCambiarReloj}>
        {activo ? <Pause /> : <Play />}{accion}
      </Button>
    </section>
  )
}
