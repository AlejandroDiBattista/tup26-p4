import type { Request, Response } from 'express';
import { Clientes } from '../services/clientes.js';

const id = (req: Request) => Clientes.id(req.params.id);
const actividadId = (req: Request) => Clientes.id(req.params.actividadId);

export const listar = (req: Request, res: Response) => { res.json(Clientes.listar(req.query.q)); };
export const obtener = (req: Request, res: Response) => { res.json(Clientes.obtener(id(req))); };
export const crear = (req: Request, res: Response) => { res.status(201).json(Clientes.crear(req.body)); };
export const editar = (req: Request, res: Response) => { res.json(Clientes.editar(id(req), req.body)); };
export const eliminar = (req: Request, res: Response) => { Clientes.eliminar(id(req)); res.sendStatus(204); };
export const agregarActividad = (req: Request, res: Response) => {
  res.status(201).json(Clientes.agregarActividad(id(req), req.body));
};
export const editarActividad = (req: Request, res: Response) => {
  res.json(Clientes.editarActividad(id(req), actividadId(req), req.body));
};
export const completarActividad = (req: Request, res: Response) => {
  res.json(Clientes.completarActividad(id(req), actividadId(req), req.body));
};
export const eliminarActividad = (req: Request, res: Response) => {
  Clientes.eliminarActividad(id(req), actividadId(req)); res.sendStatus(204);
};
