import type { Request, Response } from 'express';
import { Clientes } from '../services/clientes.js';

export const listar = (req: Request, res: Response) => res.json(Clientes.listar(req.query.q ?? ''));
export const obtener = (req: Request, res: Response) => res.json(Clientes.detalle(req.params.clienteId));
export const crear = (req: Request, res: Response) => res.status(201).json(Clientes.crear(req.body));
export const actualizar = (req: Request, res: Response) => res.json(Clientes.actualizar(req.params.clienteId, req.body));
export const eliminar = (req: Request, res: Response) => {
  Clientes.eliminar(req.params.clienteId);
  res.status(204).end();
};
export const listarActividades = (req: Request, res: Response) => res.json(Clientes.listarActividades(req.params.clienteId));
export const obtenerActividad = (req: Request, res: Response) => res.json(Clientes.obtenerActividad(req.params.clienteId, req.params.actividadId));
export const agregarActividad = (req: Request, res: Response) => res.status(201).json(Clientes.agregarActividad(req.params.clienteId, req.body));
export const actualizarActividad = (req: Request, res: Response) => res.json(Clientes.actualizarActividad(req.params.clienteId, req.params.actividadId, req.body));
export const completarActividad = (req: Request, res: Response) => res.json(Clientes.completarActividad(req.params.clienteId, req.params.actividadId));
export const eliminarActividad = (req: Request, res: Response) => {
  Clientes.eliminarActividad(req.params.clienteId, req.params.actividadId);
  res.status(204).end();
};
