import type { Request, Response } from 'express';
import { Clientes } from '../services/clientes.service';

const id = (req: Request) => Number(req.params.id);

// GET /api/clientes?q=texto&campo=email
export function listar(req: Request, res: Response) {
  const { q, campo } = req.query;
  res.json(Clientes.buscar(String(q ?? ''), campo ? String(campo) : undefined));
}

// GET /api/clientes/:id
export function obtener(req: Request, res: Response) {
  res.json(Clientes.obtener(id(req)));
}

// POST /api/clientes
export function crear(req: Request, res: Response) {
  const cliente = Clientes.crear(req.body);
  res.status(201).location(`/api/clientes/${cliente.id}`).json(cliente);
}

// PUT /api/clientes/:id
export function actualizar(req: Request, res: Response) {
  res.json(Clientes.actualizar(id(req), req.body));
}

// DELETE /api/clientes/:id
export function eliminar(req: Request, res: Response) {
  Clientes.eliminar(id(req));
  res.status(204).end();
}
