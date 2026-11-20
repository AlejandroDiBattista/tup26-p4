import type { Request, Response } from 'express';
import { Clientes } from '../services/clientes';
import { idParam } from './params';

export const listar = async (req: Request, res: Response) => {
  res.json(await Clientes.listarActividades(idParam(req, 'clienteId')));
};

export const crear = async (req: Request, res: Response) => {
  const actividad = await Clientes.crearActividad(idParam(req, 'clienteId'), req.body ?? {});
  res.status(201).json(actividad);
};

export const actualizar = async (req: Request, res: Response) => {
  const actividad = await Clientes.actualizarActividad(
    idParam(req, 'clienteId'), idParam(req, 'id'), req.body ?? {},
  );
  res.json(actividad);
};

export const completar = async (req: Request, res: Response) => {
  res.json(await Clientes.completarActividad(idParam(req, 'clienteId'), idParam(req, 'id')));
};

export const eliminar = async (req: Request, res: Response) => {
  await Clientes.eliminarActividad(idParam(req, 'clienteId'), idParam(req, 'id'));
  res.status(204).end();
};
