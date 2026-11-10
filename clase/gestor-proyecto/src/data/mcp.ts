import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import type {
  Estado,
  NuevaTarea,
  NuevoProyecto,
  NuevoResponsable,
  Proyecto,
  Responsable,
  Tarea,
} from './types'

const url = import.meta.env.VITE_MCP_URL || 'http://127.0.0.1:43182/mcp'
let conexion: Promise<Client> | null = null

// Conecta una sola vez al servidor y permite reintentar si no está disponible.
function conectar(): Promise<Client> {
  if (!conexion) {
    const pendiente = (async () => {
      const cliente = new Client({ name: 'trama-web', version: '1.0.0' })
      await cliente.connect(new StreamableHTTPClientTransport(new URL(url)))
      return cliente
    })().catch(() => {
      if (conexion === pendiente) conexion = null
      throw new Error('No se pudo conectar con el servidor MCP. Comprobá que esté funcionando.')
    })
    conexion = pendiente
  }
  return conexion
}

// Ejecuta una herramienta MCP y transforma sus errores en mensajes para la aplicación.
async function llamar<T>(nombre: string, argumentos: Record<string, unknown> = {}): Promise<T> {
  const cliente = await conectar()
  let respuesta
  try {
    respuesta = await cliente.callTool({ name: nombre, arguments: argumentos })
  } catch {
    conexion = null
    throw new Error(
      'Se perdió la comunicación con el servidor MCP. Comprobá si la operación se realizó antes de reintentar.',
    )
  }
  const contenido = Array.isArray(respuesta.content)
    ? respuesta.content.find((item) => item.type === 'text')
    : undefined
  if (!contenido || typeof contenido.text !== 'string')
    throw new Error('El servidor MCP devolvió una respuesta inválida.')
  if (respuesta.isError) throw new Error(contenido.text)
  try {
    return JSON.parse(contenido.text) as T
  } catch {
    throw new Error('El servidor MCP devolvió datos inválidos.')
  }
}

type Workspace = {
  proyectos: Proyecto[]
  responsables: Responsable[]
  tareas: Tarea[]
  estados: Estado[]
}
// Consulta los datos que muestran las pantallas.
export const loadWorkspace = () => llamar<Workspace>('obtener_espacio')
// Guarda el conjunto ordenado de estados.
export const guardarEstados = (estados: Estado[]) => llamar('guardar_estados', { estados })
// Crea un proyecto.
export const createProyecto = (datos: NuevoProyecto) =>
  llamar<Proyecto>('crear_proyecto', { ...datos })
// Modifica un proyecto.
export const updateProyecto = (id: string, datos: Partial<NuevoProyecto>) =>
  llamar<Proyecto>('editar_proyecto', { ...datos, id })
// Elimina un proyecto y sus tareas.
export const deleteProyecto = (id: string) => llamar('eliminar_proyecto', { id })
// Crea un responsable.
export const createResponsable = (datos: NuevoResponsable) =>
  llamar<Responsable>('crear_responsable', { ...datos })
// Modifica un responsable.
export const updateResponsable = (id: string, datos: Partial<NuevoResponsable>) =>
  llamar<Responsable>('editar_responsable', { ...datos, id })
// Elimina un responsable sin tareas asignadas.
export const deleteResponsable = (id: string) => llamar('eliminar_responsable', { id })
// Crea una tarea en el primer estado.
export const createTarea = (datos: NuevaTarea) => llamar<Tarea>('crear_tarea', { ...datos })
// Modifica una tarea, respetando las reglas del flujo.
export const updateTarea = (id: string, datos: Partial<Omit<Tarea, 'id'>>) =>
  llamar<Tarea>('editar_tarea', { ...datos, id })
// Elimina una tarea.
export const deleteTarea = (id: string) => llamar('eliminar_tarea', { id })
