import type { Request, Response } from 'express';
import { Clientes } from '../services/clientes.service.ts';
import { leerId } from '../utils/parametros.ts';

export async function actualizar(req: Request, res: Response) {
  const id = leerId(req.params.id);
  const actividad = await Clientes.actualizarActividad(id, req.body);
  res.json(actividad);
}

export async function completar(req: Request, res: Response) {
  const id = leerId(req.params.id);
  const actividad = await Clientes.completarActividad(id);
  res.json(actividad);
}

export async function eliminar(req: Request, res: Response) {
  const id = leerId(req.params.id);
  await Clientes.eliminarActividad(id);
  res.status(204).end();
}