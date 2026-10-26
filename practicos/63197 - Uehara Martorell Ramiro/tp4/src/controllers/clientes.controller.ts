import type { Request, Response } from "express";
import { Clientes } from "../services/Clientes";

const id = (req: Request) => Number(req.params.id);

export function listar(req: Request, res: Response) {
  res.json(Clientes.listar(String(req.query.q ?? "")));
}

export function obtener(req: Request, res: Response) {
  res.json(Clientes.obtener(id(req)));
}

export function crear(req: Request, res: Response) {
  res.status(201).json(Clientes.crear(req.body));
}

export function actualizar(req: Request, res: Response) {
  res.json(Clientes.actualizar(id(req), req.body));
}

export function eliminar(req: Request, res: Response) {
  Clientes.eliminar(id(req));
  res.status(204).end();
}

export function agregarActividad(req: Request, res: Response) {
  res.status(201).json(Clientes.agregarActividad(id(req), req.body));
}
