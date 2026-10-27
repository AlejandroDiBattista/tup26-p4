import type { Request, Response } from 'express'
import { Clientes } from '../services/clientes'
import { leerId } from './utiles'

export const listar = (req: Request, res: Response) => {
  const busqueda = typeof req.query.q === 'string' ? req.query.q : ''
  res.json(Clientes.listar(busqueda))
}

export const obtener = (req: Request, res: Response) => {
  res.json(Clientes.obtener(leerId(req.params.id)))
}

export const crear = (req: Request, res: Response) => {
  res.status(201).json(Clientes.crear(req.body ?? {}))
}

export const actualizar = (req: Request, res: Response) => {
  res.json(Clientes.actualizar(leerId(req.params.id), req.body ?? {}))
}

export const eliminar = (req: Request, res: Response) => {
  Clientes.eliminar(leerId(req.params.id))
  res.status(204).end()
}
