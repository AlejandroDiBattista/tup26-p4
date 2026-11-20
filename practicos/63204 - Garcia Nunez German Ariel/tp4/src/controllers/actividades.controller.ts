import type { Request, Response } from "express";
import { Clientes } from "../services/clientes.js";

export async function actualizarActividad(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const actualizada = await Clientes.actualizarActividad(id, req.body);
    res.json(actualizada);
  } catch (error: any) {
    if (error.message.includes("no se pueden editar ni borrar")) {
      return res.status(409).json({ error: error.message });
    }
    if (error.message.includes("no encontrada")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
}

export async function completarActividad(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const completada = await Clientes.completarActividad(id);
    res.json(completada);
  } catch (error: any) {
    const status = error.message.includes("no encontrada") ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
}

export async function eliminarActividad(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    await Clientes.eliminarActividad(id);
    res.status(204).send();
  } catch (error: any) {
    if (error.message.includes("no se pueden editar ni borrar")) {
      return res.status(409).json({ error: error.message });
    }
    const status = error.message.includes("no encontrada") ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
}
