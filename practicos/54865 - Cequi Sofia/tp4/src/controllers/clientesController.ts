import type { Request, Response } from "express";
import { Clientes } from "../services/Clientes.js";

export const getClientes = async (req: Request, res: Response) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const lista = await Clientes.buscar(q);
    res.json(lista);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al obtener clientes" });
  }
};

export const getClientePorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const cliente = await Clientes.obtenerPorId(id);
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });

    res.json(cliente);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al buscar cliente" });
  }
};

export const createCliente = async (req: Request, res: Response) => {
  try {
    const { nombre, apellido, email, telefono, domicilio, localidad } = req.body;
    if (!nombre || !apellido || !email) {
      return res.status(400).json({ error: "Nombre, apellido y email son obligatorios" });
    }

    const nuevo = await Clientes.crear({
      nombre,
      apellido,
      email,
      telefono,
      domicilio,
      localidad
    });
    res.status(201).json(nuevo);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al crear cliente" });
  }
};

export const updateCliente = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const actualizado = await Clientes.actualizar(id, req.body);
    if (!actualizado) return res.status(404).json({ error: "Cliente no encontrado" });

    res.json(actualizado);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al actualizar cliente" });
  }
};

export const deleteCliente = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const eliminado = await Clientes.eliminar(id);
    if (!eliminado) return res.status(404).json({ error: "Cliente no encontrado" });

    res.json({ message: "Cliente eliminado correctamente", cliente: eliminado });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al eliminar cliente" });
  }
};

