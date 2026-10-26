import type { RequestHandler } from "express";
import { Clientes, ErrorHttp } from "../services/clientes.js";

function id(value: unknown): number {
  if (
    typeof value !== "string" ||
    !/^[1-9]\d*$/.test(value) ||
    !Number.isSafeInteger(Number(value))
  )
    throw new ErrorHttp(400, "Identificador inválido.");
  return Number(value);
}
export const listar: RequestHandler = async (req, res) => {
  if (req.query.q !== undefined && typeof req.query.q !== "string")
    throw new ErrorHttp(400, "Búsqueda inválida.");
  res.json(await Clientes.listar(req.query.q as string | undefined));
};
export const obtener: RequestHandler = async (req, res) => {
  res.json(await Clientes.obtener(id(req.params.clienteId)));
};
export const crear: RequestHandler = async (req, res) => {
  res.status(201).json(await Clientes.crear(req.body));
};
export const actualizar: RequestHandler = async (req, res) => {
  res.json(await Clientes.actualizar(id(req.params.clienteId), req.body));
};
export const eliminar: RequestHandler = async (req, res) => {
  await Clientes.eliminar(id(req.params.clienteId));
  res.sendStatus(204);
};
export const agregarActividad: RequestHandler = async (req, res) => {
  res
    .status(201)
    .json(await Clientes.agregarActividad(id(req.params.clienteId), req.body));
};
export const editarActividad: RequestHandler = async (req, res) => {
  res.json(
    await Clientes.modificarActividad(
      id(req.params.clienteId),
      id(req.params.actividadId),
      req.body,
    ),
  );
};
export const completarActividad: RequestHandler = async (req, res) => {
  res.json(
    await Clientes.completarActividad(
      id(req.params.clienteId),
      id(req.params.actividadId),
    ),
  );
};

export const listarActividades: RequestHandler = async (req, res) => {
  res.json(await Clientes.listarActividades(id(req.params.clienteId)));
};
export const obtenerActividad: RequestHandler = async (req, res) => {
  res.json(
    await Clientes.obtenerActividad(
      id(req.params.clienteId),
      id(req.params.actividadId),
    ),
  );
};
export const eliminarActividad: RequestHandler = async (req, res) => {
  await Clientes.eliminarActividad(
    id(req.params.clienteId),
    id(req.params.actividadId),
  );
  res.sendStatus(204);
};
