import { useCallback, useState } from 'react'

/** Tracks the state of a user-initiated mutation without hiding server errors. */
// Gestiona la ejecución y los errores de una acción administrativa.
export function useAdminAction() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  // Limpia el error de la última acción.
  const clear = useCallback(() => setError(''), [])
  // Ejecuta una acción y controla su resultado.
  const run = useCallback(async (action: () => Promise<unknown>) => {
    setError('')
    setPending(true)
    try {
      await action()
      return true
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo completar la operación.')
      return false
    } finally {
      setPending(false)
    }
  }, [])
  return { pending, error, clear, run }
}
