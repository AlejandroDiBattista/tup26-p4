import type { RequestHandler } from "express";
import { cuerpo, parseId, pick } from "../http/util.js";
import { Clientes } from "./clientes.js";

const FILTROS = ["nombre", "apellido", "email", "domicilio", "localidad", "telefono", "q"] as const;

export const listar: RequestHandler = async (req, res) => {
  res.json(await Clientes.buscar(pick(req.query, FILTROS)));
};

export const obtener: RequestHandler = async (req, res) => {
  const id = parseId(req.params.id);
  await Clientes.cliente(id);
  res.json((await Clientes.obtener(id))!);
};

export const crear: RequestHandler = async (req, res) => {
  const { actividades, ...datos } = cuerpo(req.body);
  const cliente = await Clientes.crear(datos as never, (actividades ?? []) as never);
  res.status(201).json((await Clientes.obtener(cliente.id))!);
};

export const actualizar: RequestHandler = async (req, res) => {
  const id = parseId(req.params.id);
  await Clientes.actualizar(id, cuerpo(req.body));
  res.json((await Clientes.obtener(id))!);
};

export const eliminar: RequestHandler = async (req, res) => {
  await Clientes.eliminar(parseId(req.params.id));
  res.status(204).end();
};
