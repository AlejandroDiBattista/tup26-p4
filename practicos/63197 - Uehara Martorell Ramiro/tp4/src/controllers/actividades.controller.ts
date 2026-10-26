import type { Request, Response } from "express";
import { Clientes } from "../services/Clientes";

const id = (req: Request) => Number(req.params.id);

export function actualizar(req: Request, res: Response) {
  res.json(Clientes.actualizarActividad(id(req), req.body));
}

export function completar(req: Request, res: Response) {
  res.json(Clientes.completarActividad(id(req)));
}

export function eliminar(req: Request, res: Response) {
  Clientes.eliminarActividad(id(req));
  res.status(204).end();
}
