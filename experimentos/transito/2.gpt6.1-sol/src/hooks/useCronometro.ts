import { useEffect, useRef, useState } from 'react'

export function useCronometro() {
  const [activo, setActivo] = useState(false)
  const [iniciado, setIniciado] = useState(false)
  const [tiempoMs, setTiempoMs] = useState(0)
  const inicio = useRef<number | null>(null)
  const acumulado = useRef(0)

  useEffect(() => {
    if (!activo) return

    const intervalo = window.setInterval(() => {
      if (inicio.current !== null) {
        setTiempoMs(acumulado.current + performance.now() - inicio.current)
      }
    }, 100)

    return () => window.clearInterval(intervalo)
  }, [activo])

  function alternar() {
    if (inicio.current === null) {
      inicio.current = performance.now()
      setIniciado(true)
      setActivo(true)
    } else {
      acumulado.current += performance.now() - inicio.current
      inicio.current = null
      setTiempoMs(acumulado.current)
      setActivo(false)
    }
  }

  function reiniciar() {
    inicio.current = null
    acumulado.current = 0
    setActivo(false)
    setIniciado(false)
    setTiempoMs(0)
  }

  return { activo, iniciado, tiempoMs, alternar, reiniciar }
}
