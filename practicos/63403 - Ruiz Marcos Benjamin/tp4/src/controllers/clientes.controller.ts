import type { Request, Response } from 'express';
import { Clientes } from '../services/clientes';
import { idParam } from './params';

export const listar = async (req: Request, res: Response) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  res.json(await Clientes.listar(q));
};

export const obtener = async (req: Request, res: Response) => {
  res.json(await Clientes.obtener(idParam(req, 'id')));
};

export const crear = async (req: Request, res: Response) => {
  res.status(201).json(await Clientes.crear(req.body ?? {}));
};

export const actualizar = async (req: Request, res: Response) => {
  res.json(await Clientes.actualizar(idParam(req, 'id'), req.body ?? {}));
};

export const eliminar = async (req: Request, res: Response) => {
  await Clientes.eliminar(idParam(req, 'id'));
  res.status(204).end();
};
