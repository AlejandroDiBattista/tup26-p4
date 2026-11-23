import type { Request, Response } from "express";
import { Clientes } from "../services/clientes";
import { manejar } from "./comun";

function idDe(req: Request): number {
  return Number(req.params.id);
}

export const listar = manejar((req: Request, res: Response) => {
  const buscar = typeof req.query.buscar === "string" ? req.query.buscar : undefined;
  res.json(Clientes.listar(buscar));
});

export const obtener = manejar((req: Request, res: Response) => {
  res.json(Clientes.obtener(idDe(req)));
});

export const crear = manejar((req: Request, res: Response) => {
  res.status(201).json(Clientes.crear(req.body ?? {}));
});

export const actualizar = manejar((req: Request, res: Response) => {
  res.json(Clientes.actualizar(idDe(req), req.body ?? {}));
});

export const eliminar = manejar((req: Request, res: Response) => {
  Clientes.eliminar(idDe(req));
  res.status(204).end();
});

export const listarActividades = manejar((req: Request, res: Response) => {
  res.json(Clientes.listarActividades(idDe(req)));
});

export const crearActividad = manejar((req: Request, res: Response) => {
  res.status(201).json(Clientes.crearActividad(idDe(req), req.body ?? {}));
});
