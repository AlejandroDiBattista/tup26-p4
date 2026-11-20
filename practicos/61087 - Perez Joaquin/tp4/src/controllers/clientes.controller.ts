import type { Request, Response } from "express";
import { Clientes, ErrorDeNegocio } from "../services/clientes.js";

const idNumerico = (valor: string | string[]) => {
  const id = Number(Array.isArray(valor) ? valor[0] : valor);
  if (!Number.isInteger(id) || id < 1) throw new ErrorDeNegocio("Id inválido.");
  return id;
};

const responderError = (error: unknown, response: Response) => {
  if (error instanceof ErrorDeNegocio) {
    return response.status(error.status).json({ error: error.message });
  }
  if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
    return response.status(409).json({ error: "Ya existe un cliente con ese email." });
  }
  console.error(error);
  return response.status(500).json({ error: "Ocurrió un error inesperado." });
};

export const listarClientes = async (request: Request, response: Response) => {
  try {
    const clientes = await Clientes.listar(String(request.query.q ?? ""));
    response.json(clientes);
  } catch (error) {
    responderError(error, response);
  }
};

export const obtenerCliente = async (request: Request, response: Response) => {
  try {
    response.json(await Clientes.obtener(idNumerico(request.params.id)));
  } catch (error) {
    responderError(error, response);
  }
};

export const crearCliente = async (request: Request, response: Response) => {
  try {
    response.status(201).json(await Clientes.crear(request.body));
  } catch (error) {
    responderError(error, response);
  }
};

export const editarCliente = async (request: Request, response: Response) => {
  try {
    response.json(await Clientes.editar(idNumerico(request.params.id), request.body));
  } catch (error) {
    responderError(error, response);
  }
};

export const eliminarCliente = async (request: Request, response: Response) => {
  try {
    await Clientes.eliminar(idNumerico(request.params.id));
    response.status(204).end();
  } catch (error) {
    responderError(error, response);
  }
};

export const crearActividad = async (request: Request, response: Response) => {
  try {
    response.status(201).json(await Clientes.agregarActividad(idNumerico(request.params.id), request.body));
  } catch (error) {
    responderError(error, response);
  }
};

export const editarActividad = async (request: Request, response: Response) => {
  try {
    response.json(await Clientes.editarActividad(idNumerico(request.params.id), request.body));
  } catch (error) {
    responderError(error, response);
  }
};

export const completarActividad = async (request: Request, response: Response) => {
  try {
    response.json(await Clientes.completarActividad(idNumerico(request.params.id)));
  } catch (error) {
    responderError(error, response);
  }
};

export const eliminarActividad = async (request: Request, response: Response) => {
  try {
    await Clientes.eliminarActividad(idNumerico(request.params.id));
    response.status(204).end();
  } catch (error) {
    responderError(error, response);
  }
};
