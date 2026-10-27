import type { Request, Response } from "express";
import { Clientes } from "../servicios/clientes.ts";

function idDe(valor: string | undefined) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw Object.assign(new Error("Id inválido"), { status: 400 });
  }
  return id;
}

export async function listar(req: Request, res: Response) {
  res.json(await Clientes.listar(String(req.query.q ?? "")));
}

export async function obtener(req: Request, res: Response) {
  const cliente = await Clientes.obtener(idDe(req.params.id));
  if (!cliente) return res.status(404).json({ error: "Cliente inexistente" });
  res.json(cliente);
}

export async function crear(req: Request, res: Response) {
  const { nombre, apellido, email } = req.body ?? {};
  if (!nombre?.trim() || !apellido?.trim() || !email?.trim()) {
    return res.status(400).json({ error: "Nombre, apellido y email son obligatorios" });
  }
  const cliente = await Clientes.crear(req.body);
  res.status(201).location(`/api/clientes/${cliente.id}`).json(cliente);
}

export async function actualizar(req: Request, res: Response) {
  const cliente = await Clientes.actualizar(idDe(req.params.id), req.body ?? {});
  if (!cliente) return res.status(404).json({ error: "Cliente inexistente" });
  res.json(cliente);
}

export async function eliminar(req: Request, res: Response) {
  const ok = await Clientes.eliminar(idDe(req.params.id));
  if (!ok) return res.status(404).json({ error: "Cliente inexistente" });
  res.status(204).end();
}
