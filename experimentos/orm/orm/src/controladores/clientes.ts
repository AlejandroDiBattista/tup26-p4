import type { RequestHandler } from "express";
import { Clientes } from "../servicios/Clientes.js";
import { ErrorHttp } from "../http/errores.js";
import {
  datosCambiosCliente,
  datosNuevoCliente,
  idDeRuta
} from "../http/validaciones.js";

export const listar: RequestHandler = async (request, response) => {
  const texto = request.query.buscar;
  const email = request.query.email;

  if (texto !== undefined && typeof texto !== "string") {
    throw new ErrorHttp(400, `"buscar" debe ser texto.`);
  }
  if (email !== undefined && typeof email !== "string") {
    throw new ErrorHttp(400, `"email" debe ser texto.`);
  }
  if (texto !== undefined && email !== undefined) {
    throw new ErrorHttp(400, "Usa buscar o email, pero no ambos.");
  }

  const resultado = email !== undefined
    ? await Clientes.buscarPorEmail(email.trim().toLocaleLowerCase("es-AR"))
    : texto !== undefined
      ? await Clientes.buscar(texto)
      : await Clientes.listar();

  response.json({ datos: Array.isArray(resultado) ? resultado : resultado ? [resultado] : [] });
};

export const obtener: RequestHandler = async (request, response) => {
  const cliente = await Clientes.buscarPorId(idDeRuta(request, "clienteId"));
  if (!cliente) throw new ErrorHttp(404, "No se encontró el cliente.");
  response.json({ datos: cliente });
};

export const crear: RequestHandler = async (request, response) => {
  const cliente = await Clientes.crear(datosNuevoCliente(request.body));
  response.status(201).json({ datos: cliente });
};

export const actualizar: RequestHandler = async (request, response) => {
  const cliente = await Clientes.actualizar(
    idDeRuta(request, "clienteId"),
    datosCambiosCliente(request.body)
  );
  if (!cliente) throw new ErrorHttp(404, "No se encontró el cliente.");
  response.json({ datos: cliente });
};

export const eliminar: RequestHandler = async (request, response) => {
  const cliente = await Clientes.eliminar(idDeRuta(request, "clienteId"));
  if (!cliente) throw new ErrorHttp(404, "No se encontró el cliente.");
  response.json({ datos: cliente, mensaje: "Cliente eliminado." });
};
