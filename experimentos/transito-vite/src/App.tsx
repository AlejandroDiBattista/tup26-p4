import { useEffect, useRef, useState } from 'react'
import Contador from './Contador'
import Cronometro from './Cronometro'
import Distribucion from './Distribucion'
import Resumen from './Resumen'
import './App.css'

const tiposVehiculos = [
  { nombre: 'Motos', emoji: '🏍️' },
  { nombre: 'Autos', emoji: '🚗' },
  { nombre: 'Camionetas', emoji: '🛻' },
  { nombre: 'Bicicletas', emoji: '🚲' },
  { nombre: 'Colectivos', emoji: '🚌' },
  { nombre: 'Camiones', emoji: '🚚' },
  { nombre: 'Taxis', emoji: '🚕' },
  { nombre: 'Otros', emoji: '🚙' },
]

const claveGuardado = 'contador-vehiculos'

type EstadoGuardado = {
  categorias: { nombre: string; emoji: string; cantidad: number }[]
  milisegundos: number
  guardadoEn: string
}

function cargarEstado(): EstadoGuardado | null {
  try {
    const contenido = localStorage.getItem(claveGuardado)
    if (!contenido) return null

    const estado = JSON.parse(contenido) as EstadoGuardado
    if (!Array.isArray(estado.categorias) || typeof estado.milisegundos !== 'number') return null
    return estado
  } catch {
    return null
  }
}

function App() {
  const [estadoInicial] = useState(cargarEstado)
  const [cantidades, setCantidades] = useState<number[]>(() =>
    tiposVehiculos.map((tipo) => estadoInicial?.categorias.find((categoria) => categoria.nombre === tipo.nombre)?.cantidad ?? 0),
  )
  const [cronometroActivo, setCronometroActivo] = useState(false)
  const [milisegundos, setMilisegundos] = useState(estadoInicial?.milisegundos ?? 0)
  const [inicioCronometro, setInicioCronometro] = useState(Date.now() - (estadoInicial?.milisegundos ?? 0))
  const [guardado, setGuardado] = useState(false)
  const referenciasContadores = useRef<(HTMLButtonElement | null)[]>([])
  const cantidadTotal = cantidades.reduce((total, cantidad) => total + cantidad, 0)

  function incrementarContador(indice: number) {
    setCantidades((actuales) =>
      actuales.map((cantidad, posicion) => posicion === indice ? cantidad + 1 : cantidad),
    )
  }

  function reiniciarContadores() {
    setCantidades(tiposVehiculos.map(() => 0))
  }

  function guardarInformacion() {
    const tiempoActual = cronometroActivo ? Date.now() - inicioCronometro : milisegundos
    const estado: EstadoGuardado = {
      categorias: tiposVehiculos.map((tipo, indice) => ({
        ...tipo,
        cantidad: cantidades[indice],
      })),
      milisegundos: tiempoActual,
      guardadoEn: new Date().toISOString(),
    }

    try {
      localStorage.setItem(claveGuardado, JSON.stringify(estado))
      setMilisegundos(tiempoActual)
      setGuardado(true)
      window.setTimeout(() => setGuardado(false), 2000)
    } catch {
      setGuardado(false)
    }
  }

  useEffect(() => {
    if (!cronometroActivo) return

    const intervalo = window.setInterval(() => {
      setMilisegundos(Date.now() - inicioCronometro)
    }, 100)

    return () => window.clearInterval(intervalo)
  }, [cronometroActivo])

  useEffect(() => {
    function manejarTecla(evento: KeyboardEvent) {
      const elemento = evento.target
      if (elemento instanceof HTMLElement && (elemento.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(elemento.tagName))) return

      const tecla = evento.key.toLowerCase()
      if (tecla === 'i' && !cronometroActivo) alternarCronometro()
      if (tecla === 'p' && cronometroActivo) alternarCronometro()
      if (tecla === 'r') reiniciarContadores()
      if (!cronometroActivo) return

      const indice = Number(evento.key) - 1
      if (Number.isInteger(indice) && indice >= 0 && indice < tiposVehiculos.length) {
        incrementarContador(indice)
        referenciasContadores.current[indice]?.focus()
      }
    }

    window.addEventListener('keydown', manejarTecla)
    return () => window.removeEventListener('keydown', manejarTecla)
  }, [cronometroActivo])

  function alternarCronometro() {
    if (cronometroActivo) {
      setMilisegundos(Date.now() - inicioCronometro)
      setCronometroActivo(false)
      return
    }

    setInicioCronometro(Date.now() - milisegundos)
    setCronometroActivo(true)
  }

  return (
    <main>
      <Cronometro
        milisegundos={milisegundos}
        activo={cronometroActivo}
        alAlternar={alternarCronometro}
        alReiniciarContadores={reiniciarContadores}
      />
      <div className="lista-contadores">
        {tiposVehiculos.map((tipo, indice) => (
          <Contador
            key={tipo.nombre}
            texto={tipo.nombre}
            emoji={tipo.emoji}
            cuenta={cantidades[indice]}
            habilitado={cronometroActivo}
            referencia={(elemento) => { referenciasContadores.current[indice] = elemento }}
            alIncrementar={() => incrementarContador(indice)}
          />
        ))}
      </div>
      <Resumen cantidad={cantidadTotal} segundos={milisegundos / 1000} />
      <Distribucion categorias={tiposVehiculos} cantidades={cantidades} />
      <button className="boton-guardar" type="button" onClick={guardarInformacion}>
        {guardado ? 'Guardado' : 'Guardar'}
      </button>
    </main>
  )
}

export default App
