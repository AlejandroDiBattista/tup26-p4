import type { RequestHandler } from "express";
import { ClientesRepositorio } from "../repositorios/clientes.js";

function idDesdeRuta(id: string) {
  const valor = Number(id);
  return Number.isInteger(valor) && valor > 0 ? valor : null;
}

function parametroId(id: string | string[] | undefined) {
  return idDesdeRuta(Array.isArray(id) ? id[0] ?? "" : id ?? "");
}

export const listarClientes: RequestHandler = async (_req, res, next) => {
  try {
    res.json(await ClientesRepositorio.listar());
  } catch (error) {
    next(error);
  }
};

export const buscarClientes: RequestHandler = async (req, res, next) => {
  try {
    res.json(await ClientesRepositorio.buscar(String(req.query.termino ?? "")));
  } catch (error) {
    next(error);
  }
};

export const obtenerCliente: RequestHandler = async (req, res, next) => {
  try {
    const id = parametroId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "El id debe ser un entero positivo." });
      return;
    }
    const cliente = await ClientesRepositorio.buscarPorId(id);
    if (!cliente) {
      res.status(404).json({ error: "Cliente no encontrado." });
      return;
    }
    res.json(cliente);
  } catch (error) {
    next(error);
  }
};

export const crearCliente: RequestHandler = async (req, res, next) => {
  try {
    const cliente = await ClientesRepositorio.crear(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    next(error);
  }
};

export const actualizarCliente: RequestHandler = async (req, res, next) => {
  try {
    const id = parametroId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "El id debe ser un entero positivo." });
      return;
    }
    const cliente = await ClientesRepositorio.actualizar(id, req.body);
    if (!cliente) {
      res.status(404).json({ error: "Cliente no encontrado." });
      return;
    }
    res.json(cliente);
  } catch (error) {
    next(error);
  }
};

export const eliminarCliente: RequestHandler = async (req, res, next) => {
  try {
    const id = parametroId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "El id debe ser un entero positivo." });
      return;
    }
    const cliente = await ClientesRepositorio.eliminar(id);
    if (!cliente) {
      res.status(404).json({ error: "Cliente no encontrado." });
      return;
    }
    res.json(cliente);
  } catch (error) {
    next(error);
  }
};
