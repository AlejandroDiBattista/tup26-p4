import { useEffect, useRef, useState } from 'react'
import { coloresEstado } from '../data/estados'
import type { Estado, Tarea } from '../data/types'

// Comprueba que todos los estados puedan guardarse sin perder tareas.
function validarEstados(estados: Estado[], tareas: Tarea[]) {
  if (estados.length < 2) return 'Debe haber al menos dos estados.'
  if (estados.some((estado) => !estado.nombre.trim()))
    return 'El nombre del estado no puede estar vacío.'
  const nombres = estados.map((estado) => estado.nombre.trim().toLocaleLowerCase('es'))
  if (new Set(nombres).size !== nombres.length)
    return 'No puede haber dos estados con el mismo nombre.'
  if (tareas.some((tarea) => !estados.some((estado) => estado.id === tarea.estado))) {
    return 'No se puede eliminar un estado que tiene tareas asignadas.'
  }
  return ''
}

// Compara el contenido y el orden de dos listas de estados.
function mismosEstados(primero: Estado[], segundo: Estado[]) {
  return (
    primero.length === segundo.length &&
    primero.every((estado, indice) => {
      const otro = segundo[indice]
      return estado.id === otro.id && estado.nombre === otro.nombre && estado.color === otro.color
    })
  )
}

// Gestiona la edición y el guardado automático de estados.
export function useEstadoSettings(
  initial: Estado[],
  tareas: Tarea[],
  guardar: (estados: Estado[]) => Promise<unknown>,
) {
  const [estados, setEstados] = useState(() => initial.map((estado) => ({ ...estado })))
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [puedeReintentar, setPuedeReintentar] = useState(false)
  const [nuevo, setNuevo] = useState('')
  const actual = useRef(estados)
  const guardados = useRef(estados)
  const pendientes = useRef<Estado[] | null>(null)
  const enCurso = useRef(false)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  const montado = useRef(true)
  const guardarActual = useRef(guardar)
  const tareasActuales = useRef(tareas)
  const procesarActual = useRef<() => void>(() => {})
  guardarActual.current = guardar
  tareasActuales.current = tareas

  // Cancela la espera de escritura antes de procesar el último cambio.
  function cancelarEspera() {
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = null
  }

  // Procesa los cambios en orden y conserva el más reciente si falla el guardado.
  async function procesarCola() {
    if (enCurso.current || !pendientes.current) return
    cancelarEspera()
    const lote = pendientes.current
    pendientes.current = null
    if (mismosEstados(lote, guardados.current)) {
      if (montado.current && mismosEstados(actual.current, guardados.current)) {
        setMensaje('Cambios guardados automáticamente.')
      }
      return
    }

    enCurso.current = true
    if (montado.current) {
      setGuardando(true)
      setMensaje('')
    }
    try {
      await guardarActual.current(lote)
      guardados.current = lote.map((estado) => ({ ...estado }))
      if (montado.current && mismosEstados(actual.current, lote)) {
        setError('')
        setPuedeReintentar(false)
        setMensaje('Cambios guardados automáticamente.')
      }
    } catch (cause) {
      const detalle = cause instanceof Error ? cause.message : 'Error desconocido.'
      if (detalle.startsWith('La operación se realizó, pero no se pudieron actualizar')) {
        guardados.current = lote.map((estado) => ({ ...estado }))
        const validacion = validarEstados(actual.current, tareasActuales.current)
        const hayCambiosNuevos = !mismosEstados(actual.current, lote)
        pendientes.current =
          hayCambiosNuevos && !validacion ? actual.current.map((estado) => ({ ...estado })) : null
        if (montado.current) {
          setError(
            validacion ||
              (hayCambiosNuevos
                ? 'Se guardó una versión anterior, pero hay cambios pendientes. Comprobá la conexión y reintentá.'
                : 'Los cambios se guardaron, pero no se pudieron actualizar los datos. Comprobá la conexión y recargá.'),
          )
          setPuedeReintentar(hayCambiosNuevos && !validacion)
        }
      } else {
        const validacion = validarEstados(actual.current, tareasActuales.current)
        pendientes.current = validacion ? null : actual.current.map((estado) => ({ ...estado }))
        if (montado.current) {
          setError(validacion || `No se pudieron guardar los cambios. ${detalle}`)
          setPuedeReintentar(!validacion)
        }
      }
      enCurso.current = false
      if (montado.current) setGuardando(false)
      return
    }
    enCurso.current = false
    if (montado.current) setGuardando(false)
    if (pendientes.current) void procesarCola()
  }
  procesarActual.current = () => void procesarCola()

  useEffect(() => {
    montado.current = true
    return () => {
      montado.current = false
      cancelarEspera()
      procesarActual.current()
    }
  }, [])

  useEffect(() => {
    if (enCurso.current || pendientes.current || temporizador.current) return
    if (!mismosEstados(actual.current, guardados.current)) return
    const copia = initial.map((estado) => ({ ...estado }))
    actual.current = copia
    guardados.current = copia
    setEstados(copia)
  }, [initial])

  // Registra un cambio válido y programa o inicia su guardado.
  function aplicarCambios(siguientes: Estado[], inmediato: boolean) {
    actual.current = siguientes
    setEstados(siguientes)
    cancelarEspera()
    const validacion = validarEstados(siguientes, tareasActuales.current)
    if (validacion) {
      pendientes.current = null
      setMensaje('')
      setError(validacion)
      setPuedeReintentar(false)
      return
    }
    setError('')
    setPuedeReintentar(false)
    pendientes.current = siguientes.map((estado) => ({ ...estado }))
    setMensaje('Cambios pendientes de guardado…')
    if (inmediato) {
      void procesarCola()
    } else {
      temporizador.current = setTimeout(() => void procesarCola(), 700)
    }
  }

  // Agrega un estado y lo guarda automáticamente.
  function agregar() {
    const nombre = nuevo.trim()
    if (!nombre) {
      setError('Escribí un nombre para el estado.')
      return
    }
    if (
      actual.current.some(
        (estado) => estado.nombre.trim().toLocaleLowerCase('es') === nombre.toLocaleLowerCase('es'),
      )
    ) {
      setError('Ya existe un estado con ese nombre.')
      return
    }
    const anteriores = actual.current
    const estado: Estado = {
      id: crypto.randomUUID(),
      nombre,
      color:
        coloresEstado.find((color) => !anteriores.some((item) => item.color === color)) ??
        coloresEstado[anteriores.length % coloresEstado.length],
    }
    setNuevo('')
    aplicarCambios([...anteriores, estado], true)
  }

  // Actualiza el nombre y espera una pausa antes de guardarlo.
  function renombrar(id: string, nombre: string) {
    aplicarCambios(
      actual.current.map((estado) => (estado.id === id ? { ...estado, nombre } : estado)),
      false,
    )
  }

  // Guarda inmediatamente un cambio de nombre pendiente.
  function guardarPendientes() {
    cancelarEspera()
    void procesarCola()
  }

  // Desplaza un estado una posición y guarda el orden.
  function mover(index: number, delta: number) {
    const destino = index + delta
    if (destino < 0 || destino >= actual.current.length) return
    const copia = [...actual.current]
    ;[copia[index], copia[destino]] = [copia[destino], copia[index]]
    aplicarCambios(copia, true)
  }

  // Mueve un estado arrastrado a la posición de otro y guarda el orden.
  function reordenar(origenId: string, destinoId: string) {
    const origen = actual.current.findIndex((estado) => estado.id === origenId)
    const destino = actual.current.findIndex((estado) => estado.id === destinoId)
    if (origen < 0 || destino < 0 || origen === destino) return
    const copia = [...actual.current]
    const [item] = copia.splice(origen, 1)
    copia.splice(destino, 0, item)
    aplicarCambios(copia, true)
  }

  // Quita y guarda un estado que no tiene tareas asignadas.
  function quitar(id: string) {
    if (actual.current.length <= 2) {
      setError('Debe haber al menos dos estados.')
      return
    }
    if (tareasActuales.current.some((tarea) => tarea.estado === id)) {
      setError('No se puede eliminar un estado que tiene tareas asignadas.')
      return
    }
    aplicarCambios(
      actual.current.filter((estado) => estado.id !== id),
      true,
    )
  }

  // Reintenta guardar el estado más reciente tras un error de conexión.
  function reintentar() {
    const validacion = validarEstados(actual.current, tareasActuales.current)
    if (validacion) {
      setError(validacion)
      setPuedeReintentar(false)
      return
    }
    setError('')
    setPuedeReintentar(false)
    pendientes.current = actual.current.map((estado) => ({ ...estado }))
    void procesarCola()
  }

  return {
    estados,
    nuevo,
    setNuevo,
    error,
    mensaje,
    guardando,
    puedeReintentar,
    agregar,
    renombrar,
    guardarPendientes,
    mover,
    reordenar,
    quitar,
    reintentar,
  }
}
