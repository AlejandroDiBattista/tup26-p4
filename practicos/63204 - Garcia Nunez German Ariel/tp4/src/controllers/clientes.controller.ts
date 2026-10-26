import type { Request, Response } from "express";
import { Clientes } from "../services/clientes.js";

export async function buscarClientes(req: Request, res: Response) {
  try {
    const q = (req.query.q || req.query.busqueda || "") as string;
    const lista = await Clientes.buscar(q);
    res.json(lista);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al buscar clientes" });
  }
}

export async function obtenerCliente(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const cliente = await Clientes.obtenerPorId(id);
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });

    const actividades = await Clientes.listarActividades(id);
    res.json({ ...cliente, actividades });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al obtener cliente" });
  }
}

export async function crearCliente(req: Request, res: Response) {
  try {
    const nuevo = await Clientes.crear(req.body);
    res.status(201).json(nuevo);
  } catch (error: any) {
    const status = error.message.includes("obligatorio") || error.message.includes("email") ? 400 : 500;
    res.status(status).json({ error: error.message });
  }
}

export async function actualizarCliente(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const actualizado = await Clientes.actualizar(id, req.body);
    res.json(actualizado);
  } catch (error: any) {
    const status = error.message.includes("no encontrado") ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
}

export async function eliminarCliente(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    await Clientes.eliminar(id);
    res.status(204).send();
  } catch (error: any) {
    const status = error.message.includes("no encontrado") ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
}

export async function listarActividades(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const actividades = await Clientes.listarActividades(id);
    res.json(actividades);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al listar actividades" });
  }
}

export async function crearActividad(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const nueva = await Clientes.crearActividad(id, req.body);
    res.status(201).json(nueva);
  } catch (error: any) {
    const status = error.message.includes("no encontrado") ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
}
