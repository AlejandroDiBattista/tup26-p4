import { useEffect, useState } from 'react'
import { borrarSesion, guardarSesion, leerSesiones, type SesionMuestreo } from '../hooks/sesiones'
import { useContadorStore } from '../store/contadorStore'
import './Sesiones.css'

function Sesiones({ onPrevisualizar }: { onPrevisualizar: (sesion: SesionMuestreo | null) => void }) {
  const [nombre, setNombre] = useState('')
  const [sesiones, setSesiones] = useState<SesionMuestreo[]>(leerSesiones)
  const [indice, setIndice] = useState(0)
  const [mostrandoVistaPrevia, setMostrandoVistaPrevia] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const cronometroCorriendo = useContadorStore((state) => state.estadoCronometro === 'corriendo')
  const cronometroDetenido = useContadorStore((state) => state.estadoCronometro === 'detenido')
  const sesionActual = sesiones[indice]
  const vistaPreviaActiva = mostrandoVistaPrevia && Boolean(sesionActual)

  useEffect(() => {
    if (sesiones.length > 0) {
      setMostrandoVistaPrevia(true)
      onPrevisualizar(sesionActual ?? null)
    }
  }, [indice, sesiones, onPrevisualizar])

  useEffect(() => {
    if (!mensaje) return
    const timeout = window.setTimeout(() => setMensaje(''), 2400)
    return () => window.clearTimeout(timeout)
  }, [mensaje])

  function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const nombreLimpio = nombre.trim()
    if (!nombreLimpio) return

    const nuevasSesiones = guardarSesion(nombreLimpio, sesiones)
    setSesiones(nuevasSesiones)
    setIndice(0)
    setMostrandoVistaPrevia(true)
    onPrevisualizar(nuevasSesiones[0])
    setNombre('')
    setMensaje('Muestreo guardado')
  }

  function borrarSesionActual() {
    if (!sesionActual) return

    const nuevasSesiones = borrarSesion(sesionActual.id, sesiones)
    const nuevoIndice = Math.min(indice, nuevasSesiones.length - 1)
    setSesiones(nuevasSesiones)
    setIndice(Math.max(nuevoIndice, 0))

    if (nuevasSesiones.length === 0) {
      setMostrandoVistaPrevia(false)
      onPrevisualizar(null)
      setMensaje('Sesión eliminada')
      return
    }

    setMostrandoVistaPrevia(true)
    onPrevisualizar(nuevasSesiones[nuevoIndice])
    setMensaje('Sesión eliminada. Se muestra la siguiente.')
  }

  return (
    <section className="sesiones">
      <form className="sesiones-formulario" onSubmit={guardar}>
        <label htmlFor="nombre-sesion">Guardar este muestreo</label>
        <div className="sesiones-campos">
          <input
            id="nombre-sesion"
            value={nombre}
            onChange={(evento) => setNombre(evento.target.value)}
            placeholder="Ej.: Av. Belgrano, mañana"
            maxLength={60}
          />
          <button type="submit" disabled={!nombre.trim() || !cronometroDetenido || vistaPreviaActiva}>Guardar</button>
        </div>
        {!cronometroDetenido && <span className="sesiones-ayuda">Detené el cronómetro para guardar el muestreo.</span>}
        {vistaPreviaActiva && <span className="sesiones-ayuda">Volvé al muestreo actual para guardarlo.</span>}
        {mensaje && <p className="sesiones-mensaje" role="status" aria-live="polite">{mensaje}</p>}
      </form>

      {sesiones.length > 0 && (
        <div className="sesiones-guardadas">
          <h2>Muestreos guardados</h2>
          <div className="sesion-navegacion">
            {sesionActual && (
              <div className="sesion-detalle">
                <strong>{sesionActual.nombre}</strong>
                <span>{indice + 1} / {sesiones.length} · {sesionActual.total} vehículos</span>
              </div>
            )}
            <div className="sesion-acciones">
              <button
                type="button"
                aria-label="Muestreo anterior"
                title="Muestreo anterior"
                disabled={cronometroCorriendo || indice >= sesiones.length - 1}
                onClick={() => setIndice(indice + 1)}
              >←</button>
              <button
                type="button"
                aria-label="Muestreo siguiente"
                title="Muestreo siguiente"
                disabled={cronometroCorriendo || indice === 0}
                onClick={() => setIndice(indice - 1)}
              >→</button>
              <button
                type="button"
                aria-label="Ver muestreo actual"
                title="Ver muestreo actual"
                disabled={cronometroCorriendo || !vistaPreviaActiva}
                onClick={() => {
                  setMostrandoVistaPrevia(false)
                  onPrevisualizar(null)
                }}
              >⌂</button>
              <button
                className="sesion-borrar"
                type="button"
                aria-label={`Borrar sesión ${sesionActual?.nombre ?? ''}`}
                title="Borrar sesión"
                disabled={cronometroCorriendo || !sesionActual}
                onClick={borrarSesionActual}
              >🗑️</button>
            </div>
          </div>
          {cronometroCorriendo && <span className="sesiones-ayuda">Pausá el cronómetro para recorrer los muestreos.</span>}
        </div>
      )}
    </section>
  )
}

export default Sesiones
