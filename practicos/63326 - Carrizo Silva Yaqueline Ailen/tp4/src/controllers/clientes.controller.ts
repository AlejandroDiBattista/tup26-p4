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

export function listarClientes(request: Request, response: Response) {
  const buscar =
    typeof request.query.buscar === "string"
      ? request.query.buscar
      : undefined;

  const resultado = Clientes.listar(buscar);

  response.status(200).json(resultado);
}

export function obtenerCliente(request: Request, response: Response) {
  const id = obtenerId(request.params.id);
  const resultado = Clientes.obtenerPorId(id);

  response.status(200).json(resultado);
}

export function crearCliente(request: Request, response: Response) {
  const resultado = Clientes.crear(request.body);

  response.status(201).json(resultado);
}

export function editarCliente(request: Request, response: Response) {
  const id = obtenerId(request.params.id);
  const resultado = Clientes.editar(id, request.body);

  response.status(200).json(resultado);
}

export function eliminarCliente(request: Request, response: Response) {
  const id = obtenerId(request.params.id);
  const resultado = Clientes.eliminar(id);

  response.status(200).json(resultado);
}