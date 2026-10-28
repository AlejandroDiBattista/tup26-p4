import type { RequestHandler } from "express";

import { Clientes } from "../servicios/clientes.js";
import { ErrorValidacion } from "../servicios/errores.js";
import { cuerpo, parseId } from "./http.js";

export const listar: RequestHandler = async (req, res) => {
  const q = req.query.q ?? "";
  if (typeof q !== "string") throw new ErrorValidacion("El parámetro q debe ser texto");
  res.json(await Clientes.buscar(q));
};

export const obtener: RequestHandler = async (req, res) => {
  res.json(await Clientes.obtener(parseId(req.params.id)));
};

export const crear: RequestHandler = async (req, res) => {
  const cliente = await Clientes.crear(cuerpo(req.body));
  res.status(201).json(await Clientes.obtener(cliente.id));
};

export const actualizar: RequestHandler = async (req, res) => {
  const id = parseId(req.params.id);
  await Clientes.actualizar(id, cuerpo(req.body));
  res.json(await Clientes.obtener(id));
};

export const eliminar: RequestHandler = async (req, res) => {
  await Clientes.eliminar(parseId(req.params.id));
  res.status(204).end();
};

export const listarActividades: RequestHandler = async (req, res) => {
  const cliente = await Clientes.obtener(parseId(req.params.id));
  res.json(cliente.actividades);
};

export const crearActividad: RequestHandler = async (req, res) => {
  res.status(201).json(await Clientes.crearActividad(parseId(req.params.id), cuerpo(req.body)));
};
