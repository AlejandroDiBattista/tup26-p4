import type { Request, Response } from "express";
import { Clientes } from "../services/clientes.ts";
import { leerId } from "./clientes.ts";

export const ActividadesController = {
  actualizar(req: Request, res: Response) {
    res.json(Clientes.actualizarActividad(leerId(req), req.body ?? {}));
  },

  completar(req: Request, res: Response) {
    res.json(Clientes.completarActividad(leerId(req)));
  },

  eliminar(req: Request, res: Response) {
    Clientes.eliminarActividad(leerId(req));
    res.status(204).end();
  },
};
