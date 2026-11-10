import { useCallback, useEffect, useRef, useState } from 'react'
import * as api from '../data/mcp'
import type {
  Estado,
  NuevaTarea,
  NuevoProyecto,
  NuevoResponsable,
  Proyecto,
  Responsable,
  Tarea,
} from '../data/types'

type Workspace = {
  proyectos: Proyecto[]
  responsables: Responsable[]
  tareas: Tarea[]
  estados: Estado[]
}
const empty: Workspace = { proyectos: [], responsables: [], tareas: [], estados: [] }

// Carga los datos compartidos y expone sus operaciones.
export function useWorkspace() {
  const [data, setData] = useState<Workspace>(empty)
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const queue = useRef<Promise<unknown>>(Promise.resolve())
  const mounted = useRef(true)
  const requestNumber = useRef(0)

  // Actualiza los datos desde el servidor.
  const refresh = useCallback(async () => {
    const requestId = ++requestNumber.current
    try {
      const result = await api.loadWorkspace()
      if (mounted.current && requestId === requestNumber.current) {
        setData(result)
        setLoaded(true)
        setError(null)
      }
      return result
    } catch (cause) {
      if (mounted.current && requestId === requestNumber.current) {
        setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los datos.')
      }
      throw cause
    } finally {
      if (mounted.current && requestId === requestNumber.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    void refresh().catch(() => {})
    return () => {
      mounted.current = false
    }
  }, [refresh])

  // Ejecuta las escrituras en orden y actualiza los datos.
  const mutate = useCallback(
    <T>(operation: () => Promise<T>): Promise<T> => {
      // Ejecuta una escritura y recupera el estado actualizado.
      const run = async () => {
        if (mounted.current) {
          setSaving(true)
          setError(null)
        }
        try {
          const result = await operation()
          try {
            await refresh()
          } catch {
            throw new Error(
              'La operación se realizó, pero no se pudieron actualizar los datos. Comprobá la conexión y volvé a cargar.',
            )
          }
          return result
        } catch (cause) {
          // Recupera los datos incluso si una eliminación en cascada quedó incompleta.
          try {
            await refresh()
          } catch {
            /* Conserva el error original. */
          }
          if (mounted.current)
            setError(cause instanceof Error ? cause.message : 'No se pudo completar la operación.')
          throw cause
        } finally {
          if (mounted.current) setSaving(false)
        }
      }
      const result = queue.current.then(run, run)
      queue.current = result.catch(() => {})
      return result
    },
    [refresh],
  )

  return {
    ...data,
    loading,
    loaded,
    saving,
    error,
    refresh,
    // Guarda la configuración de estados.
    guardarEstados: (value: Estado[]) => mutate(() => api.guardarEstados(value)),
    // Crea un proyecto.
    createProyecto: (value: NuevoProyecto) => mutate(() => api.createProyecto(value)),
    // Actualiza un proyecto.
    updateProyecto: (id: string, value: Partial<NuevoProyecto>) =>
      mutate(() => api.updateProyecto(id, value)),
    // Elimina un proyecto.
    deleteProyecto: (id: string) => mutate(() => api.deleteProyecto(id)),
    // Crea un responsable.
    createResponsable: (value: NuevoResponsable) => mutate(() => api.createResponsable(value)),
    // Actualiza un responsable.
    updateResponsable: (id: string, value: Partial<NuevoResponsable>) =>
      mutate(() => api.updateResponsable(id, value)),
    // Elimina un responsable.
    deleteResponsable: (id: string) => mutate(() => api.deleteResponsable(id)),
    // Crea una tarea.
    createTarea: (value: NuevaTarea) => mutate(() => api.createTarea(value)),
    // Actualiza una tarea.
    updateTarea: (id: string, value: Partial<Omit<Tarea, 'id'>>) =>
      mutate(() => api.updateTarea(id, value)),
    // Elimina una tarea.
    deleteTarea: (id: string) => mutate(() => api.deleteTarea(id)),
  }
}

export type WorkspaceState = ReturnType<typeof useWorkspace>
