import type { Request, Response } from 'express';
import { Clientes } from '../services/clientes.service.ts';

const ids = (req: Request) => [Number(req.params.id), Number(req.params.actividadId)] as const;

export const agregar = async (req: Request, res: Response) => {
  res.status(201).json(await Clientes.agregarActividad(Number(req.params.id), req.body));
};

export const editar = async (req: Request, res: Response) => {
  res.json(await Clientes.editarActividad(...ids(req), req.body));
};

export const completar = async (req: Request, res: Response) => {
  res.json(await Clientes.completarActividad(...ids(req)));
};

export const eliminar = async (req: Request, res: Response) => {
  await Clientes.eliminarActividad(...ids(req));
  res.status(204).end();
};
