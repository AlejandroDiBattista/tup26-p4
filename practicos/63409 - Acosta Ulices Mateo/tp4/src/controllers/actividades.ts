import type { Request, Response } from "express";
import { Clientes } from "../services/clientes.js";

const clienteId = (req: Request) => Number(req.params.clienteId);
const id = (req: Request) => Number(req.params.id);

// GET /api/clientes/:clienteId/actividades
export async function listar(req: Request, res: Response) {
  res.json(await Clientes.listarActividades(clienteId(req)));
}

// POST /api/clientes/:clienteId/actividades
export async function crear(req: Request, res: Response) {
  res.status(201).json(await Clientes.agregarActividad(clienteId(req), req.body));
}

// PATCH /api/clientes/:clienteId/actividades/:id
export async function actualizar(req: Request, res: Response) {
  res.json(await Clientes.actualizarActividad(clienteId(req), id(req), req.body));
}

// POST /api/clientes/:clienteId/actividades/:id/completar
export async function completar(req: Request, res: Response) {
  res.json(await Clientes.completarActividad(clienteId(req), id(req), req.body?.fecha));
}

// DELETE /api/clientes/:clienteId/actividades/:id
export async function borrar(req: Request, res: Response) {
  await Clientes.borrarActividad(clienteId(req), id(req));
  res.status(204).end();
}
