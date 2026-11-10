import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

type Mensaje = {
  id: string
  autor: 'usuario' | 'asistente'
  texto: string
  destino?: { ruta: string; etiqueta: string }
}
type Respuesta = {
  texto: string
  anterior: string
  destino: { ruta: string; etiqueta: string } | null
  cambio: boolean
  error?: string
}
const url = import.meta.env.VITE_ASSISTANT_URL || 'http://127.0.0.1:43183/chat'

// Gestiona la conversación y muestra en la aplicación los resultados de las herramientas.
export function useAssistant(actualizar: () => Promise<unknown>) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [esperando, setEsperando] = useState(false)
  const [error, setError] = useState('')
  const anterior = useRef<string | undefined>(undefined)
  const ocupada = useRef(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Envía un mensaje y abre el destino devuelto por el asistente.
  async function enviar(texto: string) {
    const mensaje = texto.trim()
    if (!mensaje || ocupada.current) return false
    ocupada.current = true
    setEsperando(true)
    setError('')
    setMensajes((lista) => [
      ...lista,
      { id: crypto.randomUUID(), autor: 'usuario', texto: mensaje },
    ])
    try {
      const respuesta = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje,
          anterior: anterior.current,
          ruta: `${location.pathname}${location.search}`,
        }),
      })
      const resultado = (await respuesta.json()) as Respuesta
      if (!respuesta.ok) throw new Error(resultado.error || 'No se pudo completar la consulta.')
      anterior.current = resultado.anterior
      setMensajes((lista) => [
        ...lista,
        {
          id: crypto.randomUUID(),
          autor: 'asistente',
          texto: resultado.texto,
          destino: resultado.destino ?? undefined,
        },
      ])
      if (resultado.cambio) {
        try {
          await actualizar()
        } catch {
          setError(
            'La operación se realizó, pero no se pudieron actualizar los datos. Recargá la página.',
          )
        }
      }
      if (resultado.destino) navigate(resultado.destino.ruta)
      return true
    } catch (causa) {
      setError(
        causa instanceof TypeError
          ? 'No se pudo conectar con el asistente. Comprobá que esté en funcionamiento.'
          : causa instanceof Error
            ? causa.message
            : 'No se pudo completar la consulta.',
      )
      return false
    } finally {
      ocupada.current = false
      setEsperando(false)
    }
  }

  // Abre nuevamente un resultado de la conversación.
  function abrir(ruta: string) {
    navigate(ruta)
  }
  // Inicia una conversación nueva sin conservar el contexto anterior.
  function limpiar() {
    if (!ocupada.current) {
      anterior.current = undefined
      setMensajes([])
      setError('')
    }
  }
  return { mensajes, esperando, error, enviar, abrir, limpiar }
}
