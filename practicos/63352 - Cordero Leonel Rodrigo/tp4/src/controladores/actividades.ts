import type { RequestHandler } from "express";

import { Clientes } from "../servicios/clientes.js";
import { cuerpo, parseId } from "./http.js";

export const actualizar: RequestHandler = async (req, res) => {
  res.json(await Clientes.actualizarActividad(parseId(req.params.id), cuerpo(req.body)));
};

export const completar: RequestHandler = async (req, res) => {
  res.json(await Clientes.completarActividad(parseId(req.params.id)));
};

export const eliminar: RequestHandler = async (req, res) => {
  await Clientes.eliminarActividad(parseId(req.params.id));
  res.status(204).end();
};
