import type { Request, Response } from 'express'
import { Clientes } from '../servicio/clientes.js'
import { invalido } from '../servicio/errores.js'

const idDe = (valor: unknown, que: string) => {
  const id = Number(valor)
  if (!Number.isInteger(id) || id <= 0) throw invalido(`${que} inválido`)
  return id
}
const clienteId = (req: Request) => idDe(req.params.clienteId, 'Id de cliente')
const actividadId = (req: Request) => idDe(req.params.id, 'Id de actividad')

export const listar = (req: Request, res: Response) => {
  res.json(Clientes.buscar(req.query as Record<string, string>))
}
export const obtener = (req: Request, res: Response) => {
  res.json(Clientes.obtener(idDe(req.params.id, 'Id de cliente')))
}
export const crear = (req: Request, res: Response) => {
  res.status(201).json(Clientes.crear(req.body ?? {}))
}
export const actualizar = (req: Request, res: Response) => {
  res.json(Clientes.actualizar(idDe(req.params.id, 'Id de cliente'), req.body ?? {}))
}
export const eliminar = (req: Request, res: Response) => {
  Clientes.eliminar(idDe(req.params.id, 'Id de cliente'))
  res.status(204).end()
}

export const listarActividades = (req: Request, res: Response) => {
  res.json(Clientes.obtener(clienteId(req)).actividades)
}
export const crearActividad = (req: Request, res: Response) => {
  res.status(201).json(Clientes.crearActividad(clienteId(req), req.body ?? {}))
}
export const actualizarActividad = (req: Request, res: Response) => {
  res.json(Clientes.actualizarActividad(clienteId(req), actividadId(req), req.body ?? {}))
}
export const completarActividad = (req: Request, res: Response) => {
  res.json(Clientes.completarActividad(clienteId(req), actividadId(req)))
}
export const eliminarActividad = (req: Request, res: Response) => {
  Clientes.eliminarActividad(clienteId(req), actividadId(req))
  res.status(204).end()
}
