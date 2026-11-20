import { Request, Response } from "express";
import { Clientes } from "../services/clientes.js";

export function listarClientes(req: Request, res: Response) {
  const clientes = Clientes.listar();

  res.json(clientes);
}

export function obtenerCliente(req: Request, res: Response) {
  const id = Number(req.params.id);

  const cliente = Clientes.obtenerPorId(id);

  if (!cliente) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  res.json(cliente);
}

export function crearCliente(req: Request, res: Response) {
  const cliente = Clientes.crear(req.body);

  res.status(201).json(cliente);
}


export function actualizarCliente(req: Request, res: Response) {
  const id = Number(req.params.id);

  const cliente = Clientes.actualizar(id, req.body);

  if (!cliente) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  res.json(cliente);
}

export function eliminarCliente(req: Request, res: Response) {
  const id = Number(req.params.id);

  const cliente = Clientes.eliminar(id);

  if (!cliente) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  res.json(cliente);
}

export function buscarClientes(req: Request, res: Response) {
  const texto = String(req.query.q ?? "");

  const clientes = Clientes.buscar(texto);

  res.json(clientes);
}
