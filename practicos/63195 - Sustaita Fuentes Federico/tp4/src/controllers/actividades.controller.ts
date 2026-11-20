import type { Request, Response } from 'express';
import { Clientes } from '../services/clientes.service';

const id = (req: Request) => Number(req.params.id);

// POST /api/clientes/:id/actividades
export function crear(req: Request, res: Response) {
  res.status(201).json(Clientes.agregarActividad(id(req), req.body));
}

// PUT /api/actividades/:id
export function editar(req: Request, res: Response) {
  res.json(Clientes.editarActividad(id(req), req.body));
}

// POST /api/actividades/:id/completar
export function completar(req: Request, res: Response) {
  res.json(Clientes.completarActividad(id(req)));
}

// DELETE /api/actividades/:id
export function eliminar(req: Request, res: Response) {
  Clientes.eliminarActividad(id(req));
  res.status(204).end();
}
