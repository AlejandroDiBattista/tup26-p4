import { useCallback, useEffect, useState } from 'react'
import { categorias } from '@/lib/categorias'
import { alternarReloj, contar, nuevoConteo, recuperarConteo, tiempoObservado, type Categoria } from '@/lib/transito'

const CLAVE = 'aforo-conteo-v1'

export function useConteo() {
  const [conteo, setConteo] = useState(() => {
    try { return recuperarConteo(localStorage.getItem(CLAVE)) } catch { return nuevoConteo() }
  })
  const [ahora, setAhora] = useState(Date.now)
  const [confirmar, setConfirmar] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState(false)
  const activo = conteo.enMarchaDesde !== null
  const tiempo = tiempoObservado(conteo, ahora)
  const total = Object.values(conteo.cantidades).reduce((suma, cantidad) => suma + cantidad, 0)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(conteo))
      // El resultado de escribir en el almacenamiento externo determina este aviso.
      // eslint-disable-next-line react/set-state-in-effect
      setErrorGuardado(false)
    } catch { setErrorGuardado(true) }
  }, [conteo])

  useEffect(() => {
    if (!activo) return
    const actualizar = () => setAhora(Date.now())
    const intervalo = window.setInterval(actualizar, 200)
    document.addEventListener('visibilitychange', actualizar)
    return () => {
      window.clearInterval(intervalo)
      document.removeEventListener('visibilitychange', actualizar)
    }
  }, [activo])

  const cambiarReloj = useCallback(() => {
    const instante = Date.now()
    setAhora(instante)
    setConteo((actual) => alternarReloj(actual, instante))
  }, [])

  const sumar = useCallback((categoria: Categoria) => {
    setConteo((actual) => contar(actual, categoria, 1))
  }, [])

  useEffect(() => {
    function teclado(evento: KeyboardEvent) {
      if (evento.repeat || evento.ctrlKey || evento.metaKey || evento.altKey || confirmar) return
      const elemento = evento.target as HTMLElement
      if (elemento.closest('input, textarea, select, [contenteditable="true"]')) return
      const categoria = categorias.find((item) => item.tecla === evento.key)
      if (categoria) { evento.preventDefault(); sumar(categoria.id) }
      if (evento.code === 'Space' && !elemento.closest('button, a')) { evento.preventDefault(); cambiarReloj() }
    }
    window.addEventListener('keydown', teclado)
    return () => window.removeEventListener('keydown', teclado)
  }, [confirmar, sumar, cambiarReloj])

  function cambiarPunto(punto: string) {
    setConteo((actual) => ({ ...actual, punto }))
  }

  function restar(categoria: Categoria) {
    setConteo((actual) => contar(actual, categoria, -1))
  }

  function reiniciar() {
    setConteo((actual) => nuevoConteo(actual.punto))
    setAhora(Date.now())
    setConfirmar(false)
  }

  return {
    conteo, activo, tiempo, total, confirmar, errorGuardado,
    cambiarPunto, cambiarReloj, sumar, restar, reiniciar,
    solicitarReinicio: () => setConfirmar(true),
    cancelarReinicio: () => setConfirmar(false),
  }
}
