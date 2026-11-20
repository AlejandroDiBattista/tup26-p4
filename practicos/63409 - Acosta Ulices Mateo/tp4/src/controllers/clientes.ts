import type { Request, Response } from "express";
import type { Cliente } from "../db/schema.js";
import { Clientes } from "../services/clientes.js";

// GET /api/clientes?localidad=ros&nombre=ana
export async function listar(req: Request, res: Response) {
  res.json(await Clientes.buscar(req.query as Partial<Cliente>));
}

// GET /api/clientes/:id
export async function obtener(req: Request, res: Response) {
  res.json(await Clientes.obtener(Number(req.params.id)));
}

// POST /api/clientes
export async function crear(req: Request, res: Response) {
  res.status(201).json(await Clientes.crear(req.body));
}

// PATCH /api/clientes/:id
export async function actualizar(req: Request, res: Response) {
  res.json(await Clientes.actualizar(Number(req.params.id), req.body));
}

// DELETE /api/clientes/:id
export async function borrar(req: Request, res: Response) {
  await Clientes.borrar(Number(req.params.id));
  res.status(204).end();
}
