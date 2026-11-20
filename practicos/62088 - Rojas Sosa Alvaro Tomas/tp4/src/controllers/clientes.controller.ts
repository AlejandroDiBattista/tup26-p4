import type { Request, Response } from 'express'
import { Clientes } from '../services/clientes.js'
import { Actividades } from '../services/actividades.js'

export const listar = (req: Request, res: Response) => {
  const busqueda = typeof req.query.q === 'string' ? req.query.q : ''
  res.json(Clientes.listar(busqueda))
}

export const obtener = (req: Request, res: Response) => {
  const cliente = Clientes.obtener(Number(req.params.id))
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' })
  res.json(cliente)
}

export const crear = (req: Request, res: Response) => {
  try {
    res.status(201).json(Clientes.crear(req.body))
  } catch (e) {
    res.status(400).json({ error: (e as Error).message })
  }
}

export const actualizar = (req: Request, res: Response) => {
  try {
    const cliente = Clientes.actualizar(Number(req.params.id), req.body)
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.json(cliente)
  } catch (e) {
    res.status(400).json({ error: (e as Error).message })
  }
}

export const eliminar = (req: Request, res: Response) => {
  if (!Clientes.eliminar(Number(req.params.id))) {
    return res.status(404).json({ error: 'Cliente no encontrado' })
  }
  res.status(204).end()
}

export const listarActividades = (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (!Clientes.obtener(id)) return res.status(404).json({ error: 'Cliente no encontrado' })
  res.json(Actividades.listarDeCliente(id))
}

export const crearActividad = (req: Request, res: Response) => {
  try {
    res.status(201).json(Actividades.crear(Number(req.params.id), req.body))
  } catch (e) {
    res.status(400).json({ error: (e as Error).message })
  }
}
