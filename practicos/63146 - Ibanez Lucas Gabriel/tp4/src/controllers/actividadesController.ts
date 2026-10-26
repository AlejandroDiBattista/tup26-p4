// Controladores HTTP de actividades. Las reglas (no tocar completadas) están en el servicio.
import type { Request, Response } from "express";
import { Clientes } from "../services/ClientesService.js";
import { cuerpo, idDe } from "./parametros.js";

const actividadId = (req: Request) => idDe(req.params.actividadId, "actividadId");

export const actividadesController = {
  async actualizar(req: Request, res: Response) {
    res.json(await Clientes.actualizarActividad(actividadId(req), cuerpo(req.body)));
  },

  async eliminar(req: Request, res: Response) {
    await Clientes.eliminarActividad(actividadId(req));
    res.status(204).end();
  },

  async completar(req: Request, res: Response) {
    res.json(await Clientes.completarActividad(actividadId(req)));
  },
};
