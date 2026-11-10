import type {
  Estado,
  NuevaTarea,
  NuevoProyecto,
  NuevoResponsable,
  Proyecto,
  Responsable,
  Tarea,
} from './types'
import { colorEstado, movimientoPermitido, responsableRequerido } from './estados'

const API_URL = (
  import.meta.env?.VITE_API_URL ||
  (typeof process !== 'undefined' ? process.env.TRAMA_API_URL : undefined) ||
  'http://127.0.0.1:43181'
).replace(/\/$/, '')

// Envía una petición a JSON Server y procesa la respuesta.
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
  } catch {
    throw new Error(
      'No se pudo conectar con el servidor. Comprobá que JSON Server esté funcionando.',
    )
  }
  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? 'El registro ya no existe. Actualizá la información e intentá nuevamente.'
        : `El servidor no pudo completar la operación (error ${response.status}).`,
    )
  }
  if (response.status === 204) return undefined as T
  const text = await response.text()
  if (!text) return undefined as T
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error('El servidor devolvió una respuesta inválida.')
  }
}

// Construye la ruta de un registro.
const itemPath = (resource: string, id: string) => `/${resource}/${encodeURIComponent(id)}`
// Envía datos para crear o actualizar un registro.
const send = <T>(path: string, method: 'POST' | 'PATCH', data: unknown) =>
  request<T>(path, { method, body: JSON.stringify(data) })
// Elimina un registro de la colección indicada.
const remove = (resource: string, id: string) =>
  request<unknown>(itemPath(resource, id), { method: 'DELETE' })
// Comprueba y normaliza un campo obligatorio.
const required = (value: string | undefined, label: string) => {
  const result = value?.trim()
  if (!result) throw new Error(`${label} es obligatorio.`)
  return result
}
// Normaliza un texto opcional.
const clean = (value: string | undefined) => value?.trim() ?? ''

// Carga proyectos, responsables, tareas y estados.
export async function loadWorkspace() {
  const [proyectos, responsables, tareas, configuracion] = await Promise.all([
    request<Proyecto[]>('/proyectos'),
    request<Responsable[]>('/responsables'),
    request<Tarea[]>('/tareas'),
    request<{ estados: Estado[] }>('/configuracion'),
  ])
  if (![proyectos, responsables, tareas].every(Array.isArray))
    throw new Error('El servidor devolvió datos inválidos.')
  if (
    !Array.isArray(configuracion.estados) ||
    configuracion.estados.length < 2 ||
    configuracion.estados.some((e) => !e.id || !e.nombre) ||
    new Set(configuracion.estados.map((e) => e.id)).size !== configuracion.estados.length ||
    tareas.some((t) => !configuracion.estados.some((e) => e.id === t.estado))
  )
    throw new Error(
      'La configuración de estados es inválida o hay tareas con estados inexistentes.',
    )
  return {
    proyectos,
    responsables,
    tareas,
    estados: configuracion.estados.map((estado, indice) => ({
      ...estado,
      color: colorEstado(estado, indice),
    })),
  }
}

// Crea un proyecto con sus datos validados.
export async function createProyecto(data: NuevoProyecto) {
  return send<Proyecto>('/proyectos', 'POST', {
    nombre: required(data.nombre, 'El nombre'),
    descripcion: clean(data.descripcion),
  })
}
// Actualiza los campos indicados de un proyecto.
export async function updateProyecto(id: string, data: Partial<NuevoProyecto>) {
  const patch: Partial<NuevoProyecto> = {}
  if (data.nombre !== undefined) patch.nombre = required(data.nombre, 'El nombre')
  if (data.descripcion !== undefined) patch.descripcion = clean(data.descripcion)
  return send<Proyecto>(itemPath('proyectos', id), 'PATCH', patch)
}
// Elimina un proyecto y sus tareas asociadas.
export async function deleteProyecto(id: string) {
  await request<Proyecto>(itemPath('proyectos', id))
  const tareas = await request<Tarea[]>('/tareas')
  // JSON Server has no transaction: remove children first so a failure never leaves orphans.
  try {
    for (const tarea of tareas.filter((t) => t.proyecto_id === id)) await remove('tareas', tarea.id)
    await remove('proyectos', id)
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Error desconocido.'
    throw new Error(
      `No se completó la eliminación. Es posible que algunas tareas ya se hayan eliminado. ${detail}`,
    )
  }
}
// Crea un responsable con sus datos validados.
export async function createResponsable(data: NuevoResponsable) {
  return send<Responsable>('/responsables', 'POST', {
    nombre: required(data.nombre, 'El nombre'),
    apellido: required(data.apellido, 'El apellido'),
    contacto: clean(data.contacto),
  })
}
// Actualiza los campos indicados de un responsable.
export async function updateResponsable(id: string, data: Partial<NuevoResponsable>) {
  const patch: Partial<NuevoResponsable> = {}
  if (data.nombre !== undefined) patch.nombre = required(data.nombre, 'El nombre')
  if (data.apellido !== undefined) patch.apellido = required(data.apellido, 'El apellido')
  if (data.contacto !== undefined) patch.contacto = clean(data.contacto)
  return send<Responsable>(itemPath('responsables', id), 'PATCH', patch)
}
// Elimina un responsable si no tiene tareas asignadas.
export async function deleteResponsable(id: string) {
  const tareas = await request<Tarea[]>('/tareas')
  if (tareas.some((t) => t.responsable_id === id)) {
    throw new Error('No se puede eliminar: primero reasigná sus tareas o dejalas sin responsable.')
  }
  await remove('responsables', id)
}
// Comprueba que existan el proyecto y el responsable.
async function validarRelaciones(proyectoId: string, responsableId: string | null) {
  if (!proyectoId) throw new Error('Seleccioná un proyecto para la tarea.')
  await request<Proyecto>(itemPath('proyectos', proyectoId))
  if (responsableId) await request<Responsable>(itemPath('responsables', responsableId))
}
// Crea una tarea en el estado inicial configurado.
export async function createTarea(data: NuevaTarea) {
  const titulo = required(data.titulo, 'El título')
  const responsable_id = data.responsable_id || null
  await validarRelaciones(data.proyecto_id, responsable_id)
  const { estados } = await request<{ estados: Estado[] }>('/configuracion')
  if (!estados?.length) throw new Error('Configurá al menos un estado antes de crear tareas.')
  return send<Tarea>('/tareas', 'POST', {
    titulo,
    descripcion: clean(data.descripcion),
    proyecto_id: data.proyecto_id,
    responsable_id,
    estado: estados[0].id,
  })
}
// Valida y actualiza los campos y relaciones de una tarea.
export async function updateTarea(id: string, data: Partial<Omit<Tarea, 'id'>>) {
  const patch: Partial<Omit<Tarea, 'id'>> = {}
  const original = await request<Tarea>(itemPath('tareas', id))
  const configuracion = await request<{ estados: Estado[] }>('/configuracion')
  if (
    original &&
    configuracion &&
    responsableRequerido(data.estado ?? original.estado, configuracion.estados) &&
    !(data.responsable_id === undefined ? original.responsable_id : data.responsable_id)
  ) {
    throw new Error('Asigná un responsable para que la tarea pueda estar en este estado.')
  }
  if (data.titulo !== undefined) patch.titulo = required(data.titulo, 'El título')
  if (data.descripcion !== undefined) patch.descripcion = clean(data.descripcion)
  if (data.estado !== undefined) {
    const estados = configuracion?.estados ?? []
    if (!estados.some((estado) => estado.id === data.estado))
      throw new Error('El estado de la tarea no es válido.')
    const responsable =
      data.responsable_id === undefined ? original?.responsable_id : data.responsable_id
    if (
      !original ||
      !movimientoPermitido(original.estado, data.estado, estados, responsable || null)
    )
      throw new Error('Solo podés mover una tarea a un estado contiguo.')
    patch.estado = data.estado
  }
  if (data.proyecto_id !== undefined || data.responsable_id !== undefined) {
    if (!original) throw new Error('No se pudo consultar la tarea.')
    if (data.proyecto_id !== undefined && data.proyecto_id !== original.proyecto_id) {
      throw new Error('No se puede cambiar el proyecto de una tarea existente.')
    }
    const proyecto = data.proyecto_id ?? original.proyecto_id
    const responsable =
      data.responsable_id === undefined ? original.responsable_id : data.responsable_id || null
    await validarRelaciones(proyecto, responsable)
    if (data.proyecto_id !== undefined) patch.proyecto_id = proyecto
    if (data.responsable_id !== undefined) patch.responsable_id = responsable
  }
  return send<Tarea>(itemPath('tareas', id), 'PATCH', patch)
}
// Elimina una tarea por su identificador.
export const deleteTarea = (id: string) => remove('tareas', id)

// Valida y guarda la configuración ordenada de estados.
export async function guardarEstados(estados: Estado[]) {
  if (estados.length < 2) throw new Error('Debe haber al menos dos estados.')
  if (
    estados.some((e) => !e.id || !e.nombre.trim()) ||
    new Set(estados.map((e) => e.id)).size !== estados.length
  )
    throw new Error('Los estados deben tener identificadores y nombres válidos.')
  if (new Set(estados.map((e) => e.nombre.trim().toLocaleLowerCase('es'))).size !== estados.length)
    throw new Error('No puede haber dos estados con el mismo nombre.')
  const tareas = await request<Tarea[]>('/tareas')
  if (tareas.some((t) => !estados.some((e) => e.id === t.estado)))
    throw new Error('No se puede eliminar un estado que tiene tareas asignadas.')
  const configuracion = await request<{ estados: Estado[] }>('/configuracion')
  if (
    configuracion.estados[0]?.id !== estados[0].id &&
    tareas.some((t) => t.estado === configuracion.estados[0]?.id && !t.responsable_id)
  ) {
    throw new Error('Asigná responsables a las tareas del primer estado antes de cambiar su orden.')
  }
  return send('/configuracion', 'PATCH', {
    estados: estados.map((e, indice) => ({
      id: e.id,
      nombre: e.nombre.trim(),
      color: colorEstado(e, indice),
    })),
  })
}
