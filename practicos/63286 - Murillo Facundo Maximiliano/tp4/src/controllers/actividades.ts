import type { RequestHandler } from "express";

import { Clientes } from "../services/clientes.js";
import { cuerpoDeSolicitud, idDeRuta, responder, responderEliminacion } from "./respuestas.js";

export const actualizarActividad: RequestHandler = async (req, res) => {
  responder(res, await Clientes.actualizarActividad(idDeRuta(req.params.id), cuerpoDeSolicitud(req.body)));
};

export const completarActividad: RequestHandler = async (req, res) => {
  responder(res, await Clientes.completarActividad(idDeRuta(req.params.id)));
};

export const eliminarActividad: RequestHandler = async (req, res) => {
  const id = idDeRuta(req.params.id);
  await Clientes.eliminarActividad(id);
  responderEliminacion(res, id);
};
