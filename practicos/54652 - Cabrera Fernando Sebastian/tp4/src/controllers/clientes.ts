import type { Request, Response } from 'express'
import { ClienteService } from '../services/clientes'

type DatosCliente = Partial<Omit<typeof import('../db/schema').clientes.$inferInsert, 'id'>>
type NuevoCliente = Omit<typeof import('../db/schema').clientes.$inferInsert, 'id'>

const camposTexto = ['empresa', 'email', 'telefono', 'direccion', 'notas'] as const

function esObjeto(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function leerDatosCliente(value: unknown, parcial: false): NuevoCliente | null
function leerDatosCliente(value: unknown, parcial: true): Partial<DatosCliente> | null
function leerDatosCliente(
  value: unknown,
  parcial: boolean,
): Partial<DatosCliente> | null {
  if (!esObjeto(value)) return null

  const datos: DatosCliente = {}

  if ('nombre' in value) {
    if (typeof value.nombre !== 'string' || value.nombre.trim() === '') return null
    datos.nombre = value.nombre
  } else if (!parcial) {
    return null
  }

  for (const campo of camposTexto) {
    if (campo in value) {
      const dato = value[campo]
      if (dato !== null && typeof dato !== 'string') return null
      datos[campo] = dato
    }
  }

  if (Object.keys(datos).length === 0) return null
  return datos
}

function leerId(value: string | string[]): number | null {
  if (Array.isArray(value)) return null
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

export class ClienteController {
  static obtenerTodos(_req: Request, res: Response) {
    res.json(ClienteService.obtenerTodos())
  }

  static obtenerPorId(req: Request, res: Response) {
    const id = leerId(req.params.id)
    if (id === null) {
      res.status(400).json({ error: 'El id debe ser un número entero positivo' })
      return
    }

    const [cliente] = ClienteService.obtenerPorId(id)
    if (!cliente) {
      res.status(404).json({ error: 'Cliente no encontrado' })
      return
    }
    res.json(cliente)
  }

  static crear(req: Request, res: Response) {
    const datos = leerDatosCliente(req.body, false)
    if (!datos || typeof datos.nombre !== 'string') {
      res.status(400).json({ error: 'Datos de cliente inválidos; el nombre es obligatorio' })
      return
    }

    const [cliente] = ClienteService.crear(datos)
    res.status(201).json(cliente)
  }

  static actualizar(req: Request, res: Response) {
    const id = leerId(req.params.id)
    if (id === null) {
      res.status(400).json({ error: 'El id debe ser un número entero positivo' })
      return
    }

    const datos = leerDatosCliente(req.body, true)
    if (!datos) {
      res.status(400).json({ error: 'Debe enviar al menos un campo válido para actualizar' })
      return
    }

    const [cliente] = ClienteService.actualizar(id, datos)
    if (!cliente) {
      res.status(404).json({ error: 'Cliente no encontrado' })
      return
    }
    res.json(cliente)
  }

  static eliminar(req: Request, res: Response) {
    const id = leerId(req.params.id)
    if (id === null) {
      res.status(400).json({ error: 'El id debe ser un número entero positivo' })
      return
    }

    const [cliente] = ClienteService.eliminar(id)
    if (!cliente) {
      res.status(404).json({ error: 'Cliente no encontrado' })
      return
    }
    res.status(204).end()
  }

  static buscar(req: Request, res: Response) {
    const texto = req.query.texto
    if (typeof texto !== 'string' || texto.trim() === '') {
      res.status(400).json({ error: 'El parámetro de búsqueda "texto" es obligatorio' })
      return
    }
    res.json(ClienteService.buscar(texto))
  }
}
