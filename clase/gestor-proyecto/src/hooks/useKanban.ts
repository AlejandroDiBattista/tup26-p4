import { useMemo, useState } from 'react'
import { nombreCompleto } from '../data/responsables'
import type { ProyectoKanban, ResponsableKanban, TareaKanban } from '../components/kanban/types'

// Normaliza el texto para buscar sin distinguir tildes ni mayúsculas.
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim()

// Filtra las tareas según la búsqueda y las opciones elegidas.
export function useKanban(
  tareas: TareaKanban[],
  proyectos: ProyectoKanban[],
  responsables: ResponsableKanban[],
  proyectoId?: string,
) {
  const [busqueda, setBusqueda] = useState('')
  const [proyecto, setProyecto] = useState('')
  const [responsable, setResponsable] = useState('')
  const resultados = useMemo(() => {
    const query = normalize(busqueda)
    const proyectosPorId = new Map(proyectos.map((item) => [item.id, item.nombre]))
    const responsablesPorId = new Map(responsables.map((item) => [item.id, nombreCompleto(item)]))
    return tareas.filter((tarea) => {
      if (proyectoId && tarea.proyecto_id !== proyectoId) return false
      if (proyecto && !proyectoId && tarea.proyecto_id !== proyecto) return false
      if (responsable === 'sin-asignar' && tarea.responsable_id !== null) return false
      if (responsable && responsable !== 'sin-asignar' && tarea.responsable_id !== responsable)
        return false
      const text = [
        tarea.titulo,
        tarea.descripcion,
        proyectosPorId.get(tarea.proyecto_id) ?? '',
        responsablesPorId.get(tarea.responsable_id ?? '') ?? '',
      ].join(' ')
      return !query || normalize(text).includes(query)
    })
  }, [tareas, proyectos, responsables, proyectoId, proyecto, responsable, busqueda])
  return { busqueda, setBusqueda, proyecto, setProyecto, responsable, setResponsable, resultados }
}
