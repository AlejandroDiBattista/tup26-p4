import type { Request, Response } from "express";
import { Clientes } from "../services/clientes.ts";
import { invalido } from "../services/errores.ts";

/** Lee el :id de la URL y verifica que sea un entero positivo. */
export function leerId(req: Request): number {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw invalido("Id inválido");
  return id;
}

export const ClientesController = {
  listar(req: Request, res: Response) {
    res.json(Clientes.listar(String(req.query.q ?? "")));
  },

  obtener(req: Request, res: Response) {
    res.json(Clientes.obtener(leerId(req)));
  },

  crear(req: Request, res: Response) {
    res.status(201).json(Clientes.crear(req.body ?? {}));
  },

  actualizar(req: Request, res: Response) {
    res.json(Clientes.actualizar(leerId(req), req.body ?? {}));
  },

  eliminar(req: Request, res: Response) {
    Clientes.eliminar(leerId(req));
    res.status(204).end();
  },

  agregarActividad(req: Request, res: Response) {
    res.status(201).json(Clientes.agregarActividad(leerId(req), req.body ?? {}));
  },
};
