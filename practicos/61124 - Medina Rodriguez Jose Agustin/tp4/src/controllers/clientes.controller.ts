import type { Request, Response } from 'express';
import { Clientes } from '../services/clientes.service.ts';
import { leerId } from '../utils/parametros.ts';

export async function listar(req: Request, res: Response) {
  const busqueda = typeof req.query.q === 'string' ? req.query.q : undefined;
  const lista = await Clientes.listar(busqueda);
  res.json(lista);
}

export async function obtener(req: Request, res: Response) {
  const id = leerId(req.params.id);
  const cliente = await Clientes.obtener(id);
  res.json(cliente);
}

export async function crear(req: Request, res: Response) {
  const cliente = await Clientes.crear(req.body);
  res.status(201).json(cliente);
}

export async function actualizar(req: Request, res: Response) {
  const id = leerId(req.params.id);
  const cliente = await Clientes.actualizar(id, req.body);
  res.json(cliente);
}

export async function eliminar(req: Request, res: Response) {
  const id = leerId(req.params.id);
  await Clientes.eliminar(id);
  res.status(204).end();
}

export async function agregarActividad(req: Request, res: Response) {
  const id = leerId(req.params.id);
  const actividad = await Clientes.agregarActividad(id, req.body);
  res.status(201).json(actividad);
}