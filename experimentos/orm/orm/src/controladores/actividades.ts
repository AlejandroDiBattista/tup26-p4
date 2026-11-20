import type { RequestHandler } from "express";
import { ErrorHttp } from "../http/errores.js";
import {
  datosCambiosActividad,
  datosNuevaActividad,
  idDeRuta
} from "../http/validaciones.js";
import { Clientes } from "../servicios/Clientes.js";

async function exigirCliente(clienteId: number) {
  if (!await Clientes.buscarPorId(clienteId)) {
    throw new ErrorHttp(404, "No se encontró el cliente.");
  }
}

export const listar: RequestHandler = async (request, response) => {
  const clienteId = idDeRuta(request, "clienteId");
  await exigirCliente(clienteId);
  response.json({ datos: await Clientes.listarActividades(clienteId) });
};

export const obtener: RequestHandler = async (request, response) => {
  const clienteId = idDeRuta(request, "clienteId");
  const actividadId = idDeRuta(request, "actividadId");
  const actividad = await Clientes.buscarActividad(clienteId, actividadId);
  if (!actividad) throw new ErrorHttp(404, "No se encontró la actividad de ese cliente.");
  response.json({ datos: actividad });
};

export const crear: RequestHandler = async (request, response) => {
  const clienteId = idDeRuta(request, "clienteId");
  await exigirCliente(clienteId);
  const actividad = await Clientes.crearActividad(
    clienteId,
    datosNuevaActividad(request.body)
  );
  response.status(201).json({ datos: actividad });
};

export const actualizar: RequestHandler = async (request, response) => {
  const actividad = await Clientes.actualizarActividad(
    idDeRuta(request, "clienteId"),
    idDeRuta(request, "actividadId"),
    datosCambiosActividad(request.body)
  );
  if (!actividad) {
    throw new ErrorHttp(404, "No se encontró una actividad pendiente de ese cliente.");
  }
  response.json({ datos: actividad });
};

export const completar: RequestHandler = async (request, response) => {
  const actividad = await Clientes.completarActividad(
    idDeRuta(request, "clienteId"),
    idDeRuta(request, "actividadId")
  );
  if (!actividad) {
    throw new ErrorHttp(404, "No se encontró una actividad pendiente de ese cliente.");
  }
  response.json({ datos: actividad, mensaje: "Actividad completada." });
};

export const eliminar: RequestHandler = async (request, response) => {
  const actividad = await Clientes.eliminarActividad(
    idDeRuta(request, "clienteId"),
    idDeRuta(request, "actividadId")
  );
  if (!actividad) {
    throw new ErrorHttp(404, "No se encontró una actividad pendiente de ese cliente.");
  }
  response.json({ datos: actividad, mensaje: "Actividad eliminada." });
};
