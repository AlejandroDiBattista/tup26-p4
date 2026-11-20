import { useEffect, useRef, useState } from 'react'
import { useContadorStore } from '../store/contadorStore'
import { DURACION_OBSERVACION_MS, INTERVALO_CRONOMETRO_MS } from '../store/constants'
import './Cronometro.css'

function formatoTiempo(milisegundos: number) {
  const decimas = Math.floor(milisegundos / 100) % 10
  const segundos = Math.floor(milisegundos / 1000) % 60
  const minutos = Math.floor(milisegundos / 60000)

  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}.${decimas}`
}

function Cronometro({ tiempoVista, vistaPrevia }: { tiempoVista: number; vistaPrevia: boolean }) {
  const tiempoActual = useContadorStore((state) => state.tiempoTranscurrido)
  const tiempo = vistaPrevia ? tiempoVista : tiempoActual
  const estado = useContadorStore((state) => state.estadoCronometro)
  const prender = useContadorStore((state) => state.prender)
  const pausar = useContadorStore((state) => state.pausar)
  const parar = useContadorStore((state) => state.parar)
  const reiniciarTodo = useContadorStore((state) => state.reiniciarTodo)
  const actualizar = useContadorStore((state) => state.actualizar)
  const duracionSegundos = DURACION_OBSERVACION_MS / 1000
  const segundosTranscurridos = Math.min(Math.floor(tiempo / 1000), duracionSegundos)
  const progreso = (segundosTranscurridos / duracionSegundos) * 100
  const periodoCompleto = tiempo >= DURACION_OBSERVACION_MS
  const estadoAnterior = useRef(estado)
  const [mostrarAvisoCompleto, setMostrarAvisoCompleto] = useState(false)

  useEffect(() => {
    if (estado !== 'corriendo') return
    const intervalo = window.setInterval(actualizar, INTERVALO_CRONOMETRO_MS)
    return () => window.clearInterval(intervalo)
  }, [estado, actualizar])

  useEffect(() => {
    const finalizoObservacion = estadoAnterior.current === 'corriendo'
      && estado === 'detenido'
      && tiempo >= DURACION_OBSERVACION_MS
    estadoAnterior.current = estado

    if (finalizoObservacion) setMostrarAvisoCompleto(true)
  }, [estado, tiempo])

  useEffect(() => {
    if (!mostrarAvisoCompleto) return
    const timeout = window.setTimeout(() => setMostrarAvisoCompleto(false), 3500)
    return () => window.clearTimeout(timeout)
  }, [mostrarAvisoCompleto])

  return (
    <section className="cronometro" aria-label="Cronómetro">
      <div className="cronometro-cabecera">
        <p className="tiempo-cronometro" role="timer" aria-label="Tiempo transcurrido">
          {formatoTiempo(tiempo)}
        </p>
        <div className="controles-cronometro">
          <button
            type="button"
            onClick={estado === 'corriendo' ? pausar : prender}
            disabled={vistaPrevia || periodoCompleto}
            aria-label={estado === 'corriendo' ? 'Pausar cronómetro' : 'Prender cronómetro'}
            title={estado === 'corriendo' ? 'Pausar' : 'Prender'}
          >
            {estado === 'corriendo' ? '⏸' : '▶'}
          </button>
          <button
            type="button"
            onClick={estado === 'detenido' ? reiniciarTodo : parar}
            disabled={vistaPrevia}
            aria-label={estado === 'detenido' ? 'Reiniciar cronómetro y contadores' : 'Parar cronómetro'}
            title={estado === 'detenido' ? 'Reiniciar todo' : 'Parar'}
          >
            {estado === 'detenido' ? '↺' : '⏹'}
          </button>
        </div>
      </div>
      <div
        className="progreso-observacion"
        role="progressbar"
        aria-label="Período de observación de cinco minutos"
        aria-valuemin={0}
        aria-valuemax={duracionSegundos}
        aria-valuenow={segundosTranscurridos}
        aria-valuetext={`${segundosTranscurridos} de ${duracionSegundos} segundos`}
      >
        <span className="progreso-observacion-valor" style={{ width: `${progreso}%` }} />
        <span className="marcas-tiempo" aria-hidden="true">
          {Array.from({ length: 29 }, (_, indice) => {
            const segundos = (indice + 1) * 10
            const minuto = segundos % 60 === 0
            return (
              <span
                key={segundos}
                className={minuto ? 'marca-tiempo marca-minuto' : 'marca-tiempo marca-diez-segundos'}
                style={{ left: `${(segundos / duracionSegundos) * 100}%` }}
              />
            )
          })}
        </span>
      </div>
      <div className="segundos-observacion" aria-hidden="true">
        <span>{segundosTranscurridos} s transcurridos</span>
        <span>{duracionSegundos} s</span>
      </div>
      {mostrarAvisoCompleto && (
        <p className="aviso-cronometro-completo" role="status" aria-live="polite">
          ¡Observación completa! Registraste {useContadorStore.getState().total} vehículos.
        </p>
      )}
    </section>
  )
}

export default Cronometro
