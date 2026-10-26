import type { Request, Response } from "express";
import { Clientes } from "../services/Clientes.js";
import { ErrorServicio } from "../services/ErrorServicio.js";

function obtenerId(valor: string | string[] | undefined) {
  if (Array.isArray(valor)) {
    throw new ErrorServicio(400, "El identificador debe ser un número válido");
  }

  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorServicio(400, "El identificador debe ser un número válido");
  }

  return id;
}

export function listarActividades(request: Request, response: Response) {
  const clienteId = obtenerId(request.params.clienteId);
  const resultado = Clientes.listarActividades(clienteId);

  response.status(200).json(resultado);
}

export function crearActividad(request: Request, response: Response) {
  const clienteId = obtenerId(request.params.clienteId);
  const resultado = Clientes.crearActividad(clienteId, request.body);

  response.status(201).json(resultado);
}

export function editarActividad(request: Request, response: Response) {
  const id = obtenerId(request.params.id);
  const resultado = Clientes.editarActividad(id, request.body);

  response.status(200).json(resultado);
}

export function completarActividad(request: Request, response: Response) {
  const id = obtenerId(request.params.id);
  const resultado = Clientes.completarActividad(id);

  response.status(200).json(resultado);
}

export function eliminarActividad(request: Request, response: Response) {
  const id = obtenerId(request.params.id);
  const resultado = Clientes.eliminarActividad(id);

  response.status(200).json(resultado);
}