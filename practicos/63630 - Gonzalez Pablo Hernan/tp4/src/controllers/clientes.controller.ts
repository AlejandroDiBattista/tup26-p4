import type { Request, Response } from 'express';
import { Clientes } from '../services/clientes.service.ts';

const id = (req: Request) => Number(req.params.id);

export const listar = async (req: Request, res: Response) => {
  res.json(await Clientes.listar(String(req.query.q ?? '')));
};

export const obtener = async (req: Request, res: Response) => {
  res.json(await Clientes.obtener(id(req)));
};

export const crear = async (req: Request, res: Response) => {
  res.status(201).json(await Clientes.crear(req.body));
};

export const actualizar = async (req: Request, res: Response) => {
  res.json(await Clientes.actualizar(id(req), req.body));
};

export const eliminar = async (req: Request, res: Response) => {
  await Clientes.eliminar(id(req));
  res.status(204).end();
};
