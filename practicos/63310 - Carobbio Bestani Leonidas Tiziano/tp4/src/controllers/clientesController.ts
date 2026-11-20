import { Request, Response } from "express";
import { Clientes } from "../services/clientes";

export const listarClientes = (req: Request, res: Response) => {
  try {
    res.json(Clientes.listar(String(req.query.q ?? "")));
  } catch {
    res.status(500).json({ error: "No se pudieron consultar los clientes." });
  }
};

export const obtenerCliente = (req: Request, res: Response) => {
  const cliente = Clientes.obtener(Number(req.params.id));
  if (!cliente) return res.status(404).json({ error: "Cliente no encontrado." });
  res.json(cliente);
};

export const crearCliente = (req: Request, res: Response) => {
  try {
    res.status(201).json(Clientes.crear(req.body));
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Datos inválidos." });
  }
};

export const actualizarCliente = (req: Request, res: Response) => {
  try {
    const cliente = Clientes.actualizar(Number(req.params.id), req.body);
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado." });
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Datos inválidos." });
  }
};

export const eliminarCliente = (req: Request, res: Response) => {
  const eliminado = Clientes.eliminar(Number(req.params.id));
  if (!eliminado) return res.status(404).json({ error: "Cliente no encontrado." });
  res.status(204).send();
};

export const listarActividadesCliente = (req: Request, res: Response) => {
  if (!Clientes.obtener(Number(req.params.id))) return res.status(404).json({ error: "Cliente no encontrado." });
  res.json(Clientes.actividadesDe(Number(req.params.id)));
};
