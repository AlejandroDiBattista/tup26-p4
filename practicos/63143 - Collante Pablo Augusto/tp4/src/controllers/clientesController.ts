import type { Request, Response } from 'express';
import { Clientes } from '../services/Clientes.js';

const id = (value: string | string[]) => Number(typeof value === 'string' ? value : NaN);

export const clientesController = {
  listar(req: Request, res: Response) {
    res.json(Clientes.listar(typeof req.query.q === 'string' ? req.query.q : ''));
  },
  obtener(req: Request, res: Response) {
    res.json(Clientes.obtener(id(req.params.id)));
  },
  crear(req: Request, res: Response) {
    res.status(201).json(Clientes.crear(req.body));
  },
  actualizar(req: Request, res: Response) {
    res.json(Clientes.actualizar(id(req.params.id), req.body));
  },
  eliminar(req: Request, res: Response) {
    Clientes.eliminar(id(req.params.id));
    res.sendStatus(204);
  },
  crearActividad(req: Request, res: Response) {
    res.status(201).json(Clientes.crearActividad(id(req.params.id), req.body));
  },
  actualizarActividad(req: Request, res: Response) {
    res.json(Clientes.actualizarActividad(id(req.params.id), id(req.params.actividadId), req.body));
  },
  completarActividad(req: Request, res: Response) {
    res.json(Clientes.completarActividad(id(req.params.id), id(req.params.actividadId)));
  },
  eliminarActividad(req: Request, res: Response) {
    Clientes.eliminarActividad(id(req.params.id), id(req.params.actividadId));
    res.sendStatus(204);
  },
};
