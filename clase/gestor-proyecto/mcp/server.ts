import { randomUUID } from 'node:crypto'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import * as api from '../src/data/api'
import type { Estado } from '../src/data/types'

let cola: Promise<unknown> = Promise.resolve()

// Ejecuta las escrituras del MCP en orden para evitar que se pisen entre sí.
function encolar<T>(operacion: () => Promise<T>): Promise<T> {
  const resultado = cola.then(operacion, operacion)
  cola = resultado.catch(() => {})
  return resultado
}

// Construye un servidor MCP con las herramientas de Trama.
export function crearServidor() {
  const server = new McpServer({ name: 'trama', version: '1.0.0' })

  // Registra una herramienta y devuelve errores legibles para el cliente MCP.
  function registrar<T extends z.ZodRawShape>(
    nombre: string,
    descripcion: string,
    esquema: T,
    ejecutar: (argumentos: z.infer<z.ZodObject<T>>) => Promise<unknown>,
    escritura = false,
    destructiva = false,
  ) {
    server.registerTool(
      nombre,
      {
        description: descripcion,
        inputSchema: esquema as z.ZodRawShape,
        annotations: { readOnlyHint: !escritura, destructiveHint: destructiva },
      },
      async (argumentos) => {
        try {
          const operacion = () => ejecutar(argumentos as z.infer<z.ZodObject<T>>)
          const resultado = escritura ? await encolar(operacion) : await operacion()
          return {
            content: [
              { type: 'text' as const, text: JSON.stringify(resultado ?? { ok: true }, null, 2) },
            ],
          }
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: error instanceof Error ? error.message : 'No se pudo completar la operación.',
              },
            ],
          }
        }
      },
    )
  }

  const id = z.string().trim().min(1).describe('Identificador exacto del registro')
  const texto = z.string().trim().min(1)
  const descripcion = z.string().optional().default('')

  // Obtiene la configuración y modifica sus estados con las validaciones compartidas.
  async function modificarEstados(cambiar: (estados: Estado[]) => Estado[]) {
    const { estados } = await api.loadWorkspace()
    const siguientes = cambiar(estados)
    await api.guardarEstados(siguientes)
    return siguientes
  }

  registrar('listar_proyectos', 'Lista proyectos y su avance por estado.', {}, async () => {
    const { proyectos, tareas, estados } = await api.loadWorkspace()
    return proyectos.map((proyecto) => {
      const propias = tareas.filter((tarea) => tarea.proyecto_id === proyecto.id)
      const finalizadas = propias.filter((tarea) => tarea.estado === estados.at(-1)?.id).length
      return {
        ...proyecto,
        total_tareas: propias.length,
        finalizadas,
        avance_porcentaje: propias.length ? Math.round((finalizadas * 100) / propias.length) : 0,
        por_estado: estados.map((estado) => ({
          id: estado.id,
          nombre: estado.nombre,
          cantidad: propias.filter((tarea) => tarea.estado === estado.id).length,
        })),
      }
    })
  })
  registrar('listar_responsables', 'Lista responsables y sus tareas asignadas.', {}, async () => {
    const { responsables, tareas } = await api.loadWorkspace()
    return responsables.map((responsable) => ({
      ...responsable,
      tareas_asignadas: tareas.filter((tarea) => tarea.responsable_id === responsable.id).length,
    }))
  })
  registrar(
    'listar_estados',
    'Lista los estados en el orden configurado; el primero es inicial y el último final.',
    {},
    async () => (await api.loadWorkspace()).estados,
  )
  registrar('obtener_espacio', 'Obtiene proyectos, responsables, tareas y estados.', {}, () =>
    api.loadWorkspace(),
  )
  registrar(
    'guardar_estados',
    'Guarda la lista completa y ordenada de estados respetando las reglas del flujo.',
    { estados: z.array(z.object({ id, nombre: texto, color: z.string().optional() })).min(2) },
    async ({ estados }) => api.guardarEstados(estados),
    true,
  )
  registrar(
    'listar_tareas',
    'Lista tareas con filtros opcionales por proyecto, responsable, estado y texto.',
    {
      proyecto_id: id.optional(),
      responsable_id: id.optional(),
      sin_asignar: z.boolean().optional(),
      estado: id.optional(),
      busqueda: z.string().optional(),
    },
    async (filtros) => {
      const { tareas } = await api.loadWorkspace()
      const normalizar = (valor: string) =>
        valor
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLocaleLowerCase('es')
      return tareas.filter(
        (tarea) =>
          (!filtros.proyecto_id || tarea.proyecto_id === filtros.proyecto_id) &&
          (!filtros.responsable_id || tarea.responsable_id === filtros.responsable_id) &&
          (!filtros.sin_asignar || tarea.responsable_id === null) &&
          (!filtros.estado || tarea.estado === filtros.estado) &&
          (!filtros.busqueda ||
            normalizar(`${tarea.titulo} ${tarea.descripcion}`).includes(
              normalizar(filtros.busqueda),
            )),
      )
    },
  )
  registrar(
    'crear_proyecto',
    'Crea un proyecto.',
    { nombre: texto, descripcion },
    async (datos) => api.createProyecto(datos),
    true,
  )
  registrar(
    'editar_proyecto',
    'Modifica el nombre o la descripción de un proyecto.',
    { id, nombre: texto.optional(), descripcion: z.string().optional() },
    async ({ id, ...datos }) => api.updateProyecto(id, datos),
    true,
  )
  registrar(
    'eliminar_proyecto',
    'Elimina un proyecto y todas sus tareas. Operación irreversible.',
    { id },
    async ({ id }) => {
      await api.deleteProyecto(id)
      return { eliminado: id }
    },
    true,
    true,
  )
  registrar(
    'crear_responsable',
    'Crea un responsable.',
    { nombre: texto, apellido: texto, contacto: descripcion },
    async (datos) => api.createResponsable(datos),
    true,
  )
  registrar(
    'editar_responsable',
    'Modifica los datos de un responsable.',
    { id, nombre: texto.optional(), apellido: texto.optional(), contacto: z.string().optional() },
    async ({ id, ...datos }) => api.updateResponsable(id, datos),
    true,
  )
  registrar(
    'eliminar_responsable',
    'Elimina un responsable solo si no tiene tareas asignadas.',
    { id },
    async ({ id }) => {
      await api.deleteResponsable(id)
      return { eliminado: id }
    },
    true,
    true,
  )
  registrar(
    'crear_tarea',
    'Crea una tarea en el primer estado; el responsable es opcional.',
    { titulo: texto, descripcion, proyecto_id: id, responsable_id: id.nullable().optional() },
    async (datos) => api.createTarea({ ...datos, responsable_id: datos.responsable_id ?? null }),
    true,
  )
  registrar(
    'editar_tarea',
    'Edita una tarea sin cambiarla de proyecto. Solo se permiten estados contiguos; una tarea sin responsable puede volver directamente al primer estado. Los demás estados requieren responsable.',
    {
      id,
      titulo: texto.optional(),
      descripcion: z.string().optional(),
      proyecto_id: id.optional(),
      estado: id.optional(),
      responsable_id: id.nullable().optional(),
    },
    async ({ id, ...datos }) => api.updateTarea(id, datos),
    true,
  )
  registrar(
    'eliminar_tarea',
    'Elimina una tarea de forma irreversible.',
    { id },
    async ({ id }) => {
      await api.deleteTarea(id)
      return { eliminada: id }
    },
    true,
    true,
  )
  registrar(
    'crear_estado',
    'Agrega un estado al final del flujo.',
    { nombre: texto },
    async ({ nombre }) => modificarEstados((estados) => [...estados, { id: randomUUID(), nombre }]),
    true,
  )
  registrar(
    'renombrar_estado',
    'Cambia el nombre de un estado.',
    { id, nombre: texto },
    async ({ id, nombre }) =>
      modificarEstados((estados) => {
        if (!estados.some((estado) => estado.id === id)) throw new Error('El estado no existe.')
        return estados.map((estado) => (estado.id === id ? { ...estado, nombre } : estado))
      }),
    true,
  )
  registrar(
    'reordenar_estados',
    'Define el orden completo de los estados mediante sus identificadores. El primero será el inicial y el último el final.',
    { ids: z.array(id).min(2) },
    async ({ ids }) =>
      modificarEstados((estados) => {
        if (
          ids.length !== estados.length ||
          new Set(ids).size !== estados.length ||
          ids.some((valor) => !estados.some((estado) => estado.id === valor))
        )
          throw new Error('Incluí una sola vez el identificador de cada estado existente.')
        return ids.map((valor) => estados.find((estado) => estado.id === valor)!)
      }),
    true,
  )
  registrar(
    'eliminar_estado',
    'Elimina un estado sin tareas asignadas. Deben quedar al menos dos estados.',
    { id },
    async ({ id }) =>
      modificarEstados((estados) => {
        if (!estados.some((estado) => estado.id === id)) throw new Error('El estado no existe.')
        return estados.filter((estado) => estado.id !== id)
      }),
    true,
    true,
  )

  return server
}
