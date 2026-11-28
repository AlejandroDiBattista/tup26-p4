import type { Request, Response } from "express";
import { Clientes } from "../services/clientes";
import { leerId } from "./clientes";

export class ActividadesController {
  static editar(req: Request, res: Response) {
    res.json(Clientes.editarActividad(leerId(req.params.id), req.body));
  }

  static completar(req: Request, res: Response) {
    res.json(Clientes.completarActividad(leerId(req.params.id)));
  }

  static eliminar(req: Request, res: Response) {
    Clientes.eliminarActividad(leerId(req.params.id));
    res.status(204).end();
  }
}
