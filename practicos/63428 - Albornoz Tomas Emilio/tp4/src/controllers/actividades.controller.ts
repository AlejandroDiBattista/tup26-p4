import type { Request, Response } from 'express'
import { Actividades } from '../services/actividades'
import { leerId } from './utiles'

export const listarDeCliente = (req: Request, res: Response) => {
  res.json(Actividades.listarPorCliente(leerId(req.params.id)))
}

export const crearEnCliente = (req: Request, res: Response) => {
  res.status(201).json(Actividades.crear(leerId(req.params.id), req.body ?? {}))
}

export const actualizar = (req: Request, res: Response) => {
  res.json(Actividades.actualizar(leerId(req.params.id), req.body ?? {}))
}

export const completar = (req: Request, res: Response) => {
  res.json(Actividades.completar(leerId(req.params.id)))
}

export const eliminar = (req: Request, res: Response) => {
  Actividades.eliminar(leerId(req.params.id))
  res.status(204).end()
}
