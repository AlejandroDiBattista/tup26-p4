import { Request, Response } from "express";
import { Clientes } from "../services/clientes.js";


export function listarActividades(req: Request, res: Response) {
  const clienteId = Number(req.params.clienteId);

  const actividades = Clientes.listarActividades(clienteId);

  res.json(actividades);
}

export function crearActividad(req: Request, res: Response) {
  const clienteId = Number(req.params.clienteId);

  const actividad = Clientes.crearActividad({
    ...req.body,
    clienteId,
  });

  res.status(201).json(actividad);
}

export function actualizarActividad(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    const actividad = Clientes.actualizarActividad(id, req.body);

    if (!actividad) {
      return res.status(404).json({ error: "Actividad no encontrada" });
    }

    res.json(actividad);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Error al actualizar actividad",
    });
  }
}

export function eliminarActividad(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    const actividad = Clientes.eliminarActividad(id);

    if (!actividad) {
      return res.status(404).json({ error: "Actividad no encontrada" });
    }

    res.json(actividad);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Error al eliminar actividad",
    });
  }
}

export function completarActividad(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    const actividad = Clientes.completarActividad(id);

    if (!actividad) {
      return res.status(404).json({ error: "Actividad no encontrada" });
    }

    res.json(actividad);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Error al completar actividad",
    });
  }
}

export function listarVencidas(req: Request, res: Response) {
  const actividades = Clientes.listarVencidas();

  res.json(actividades);
}