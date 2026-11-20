import type { RequestHandler } from "express";
import { Clientes } from "../services/clientesService.js";

const idDeRuta = (value: string | string[] | undefined): number =>
  Number(Array.isArray(value) ? NaN : value);

export const listarClientes: RequestHandler = (req, res) => {
  const busqueda = req.query.q;
  if (busqueda !== undefined && typeof busqueda !== "string") {
    res.status(400).json({ error: "El parámetro q debe ser texto." });
    return;
  }
  res.json(Clientes.listar(busqueda));
};

export const obtenerCliente: RequestHandler = (req, res) => res.json(Clientes.obtener(idDeRuta(req.params.id)));
export const crearCliente: RequestHandler = (req, res) => res.status(201).json(Clientes.crear(req.body));
export const actualizarCliente: RequestHandler = (req, res) => res.json(Clientes.actualizar(idDeRuta(req.params.id), req.body));
export const eliminarCliente: RequestHandler = (req, res) => {
  Clientes.eliminar(idDeRuta(req.params.id));
  res.status(204).send();
};
export const listarActividades: RequestHandler = (req, res) => res.json(Clientes.listarActividades(idDeRuta(req.params.id)));
export const crearActividad: RequestHandler = (req, res) => res.status(201).json(Clientes.crearActividad(idDeRuta(req.params.id), req.body));
export const actualizarActividad: RequestHandler = (req, res) => res.json(Clientes.actualizarActividad(idDeRuta(req.params.id), req.body));
export const completarActividad: RequestHandler = (req, res) => res.json(Clientes.completarActividad(idDeRuta(req.params.id)));
export const eliminarActividad: RequestHandler = (req, res) => {
  Clientes.eliminarActividad(idDeRuta(req.params.id));
  res.status(204).send();
};
