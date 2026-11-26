import type { Request, Response } from "express";
import { Clientes } from "../services/clientes";
import { manejar } from "./comun";

function idDe(req: Request): number {
  return Number(req.params.id);
}

export const actualizar = manejar((req: Request, res: Response) => {
  res.json(Clientes.actualizarActividad(idDe(req), req.body ?? {}));
});

export const completar = manejar((req: Request, res: Response) => {
  res.json(Clientes.completarActividad(idDe(req)));
});

export const eliminar = manejar((req: Request, res: Response) => {
  Clientes.eliminarActividad(idDe(req));
  res.status(204).end();
});
