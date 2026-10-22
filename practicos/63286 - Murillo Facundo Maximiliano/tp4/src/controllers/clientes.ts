import type { RequestHandler } from "express";

import { Clientes, ErrorDeNegocio } from "../services/clientes.js";
import { cuerpoDeSolicitud, idDeRuta, responder, responderEliminacion } from "./respuestas.js";

export const listarClientes: RequestHandler = async (req, res) => {
  const consulta = req.query.q ?? "";
  if (typeof consulta !== "string") {
    throw new ErrorDeNegocio("El parámetro q debe ser un texto.", "VALIDACION");
  }
  responder(res, await Clientes.listar(consulta));
};

export const obtenerCliente: RequestHandler = async (req, res) => {
  responder(res, await Clientes.obtenerPorId(idDeRuta(req.params.id)));
};

export const crearCliente: RequestHandler = async (req, res) => {
  responder(res, await Clientes.crear(cuerpoDeSolicitud(req.body)), 201);
};

export const actualizarCliente: RequestHandler = async (req, res) => {
  responder(res, await Clientes.actualizar(idDeRuta(req.params.id), cuerpoDeSolicitud(req.body)));
};

export const eliminarCliente: RequestHandler = async (req, res) => {
  const id = idDeRuta(req.params.id);
  await Clientes.eliminar(id);
  responderEliminacion(res, id);
};

export const listarActividadesCliente: RequestHandler = async (req, res) => {
  responder(res, await Clientes.listarActividades(idDeRuta(req.params.id)));
};

export const crearActividadCliente: RequestHandler = async (req, res) => {
  const clienteId = idDeRuta(req.params.id);
  responder(res, await Clientes.crearActividad(clienteId, cuerpoDeSolicitud(req.body)), 201);
};
