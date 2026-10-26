import type { RequestHandler } from "express";
import { Clientes } from "../clientes/clientes.js";
import { ErrorValidacion } from "../clientes/errores.js";
import { cuerpo, parseId, pick } from "../http/util.js";

const FILTROS = [
  "descripcion", "estado", "compromisoDesde", "compromisoHasta", "finalizacionDesde", "finalizacionHasta",
] as const;

const clienteId = (req: Parameters<RequestHandler>[0]) => parseId(req.params.clienteId, "clienteId");

export const listar: RequestHandler = async (req, res) => {
  const id = clienteId(req);
  await Clientes.cliente(id);
  const filtro = pick(req.query, FILTROS) as Parameters<typeof Clientes.buscarActividades>[0];
  res.json(await Clientes.buscarActividades({ ...filtro, clienteId: id }));
};

export const obtener: RequestHandler = async (req, res) => {
  res.json(await Clientes.actividad(clienteId(req), parseId(req.params.id)));
};

export const crear: RequestHandler = async (req, res) => {
  res.status(201).json(await Clientes.crearActividad(clienteId(req), cuerpo(req.body) as never));
};

export const actualizar: RequestHandler = async (req, res) => {
  const { id } = await Clientes.actividad(clienteId(req), parseId(req.params.id));
  res.json(await Clientes.actualizarActividad(id, cuerpo(req.body)));
};

export const completar: RequestHandler = async (req, res) => {
  const { id } = await Clientes.actividad(clienteId(req), parseId(req.params.id));
  const { fecha } = cuerpo(req.body ?? {});
  if (fecha !== undefined && typeof fecha !== "string") throw new ErrorValidacion("fecha debe ser texto YYYY-MM-DD");
  res.json(await Clientes.completarActividad(id, fecha));
};

export const eliminar: RequestHandler = async (req, res) => {
  const { id } = await Clientes.actividad(clienteId(req), parseId(req.params.id));
  await Clientes.eliminarActividad(id);
  res.status(204).end();
};
