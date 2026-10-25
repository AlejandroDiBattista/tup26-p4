import type { Request, Response } from "express";
import { Clientes } from "../services/Clientes.js";

export const getActividadesPorCliente = async (req: Request, res: Response) => {
  try {
    const clienteId = Number(req.params.id);
    if (isNaN(clienteId)) return res.status(400).json({ error: "ID de cliente inválido" });

    const lista = await Clientes.listarActividades(clienteId);
    res.json(lista);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al obtener actividades" });
  }
};

export const createActividad = async (req: Request, res: Response) => {
  try {
    const clienteId = Number(req.params.id);
    if (isNaN(clienteId)) return res.status(400).json({ error: "ID de cliente inválido" });

    const { descripcion, fechaCompromiso } = req.body;
    if (!descripcion || !descripcion.trim()) {
      return res.status(400).json({ error: "La descripción es requerida" });
    }

    const nueva = await Clientes.agregarActividad(clienteId, {
      descripcion,
      fechaCompromiso: fechaCompromiso || null
    });
    res.status(201).json(nueva);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al crear actividad" });
  }
};

export const updateActividad = async (req: Request, res: Response) => {
  try {
    const actividadId = Number(req.params.actividadId);
    if (isNaN(actividadId)) return res.status(400).json({ error: "ID de actividad inválido" });

    const { descripcion, fechaCompromiso } = req.body;
    const actualizada = await Clientes.actualizarActividad(actividadId, {
      descripcion,
      fechaCompromiso
    });

    if (!actualizada) return res.status(404).json({ error: "Actividad no encontrada" });
    res.json(actualizada);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Error al actualizar actividad" });
  }
};

export const completeActividad = async (req: Request, res: Response) => {
  try {
    const actividadId = Number(req.params.actividadId);
    if (isNaN(actividadId)) return res.status(400).json({ error: "ID de actividad inválido" });

    const { fechaFinalizacion } = req.body || {};
    const completada = await Clientes.completarActividad(actividadId, fechaFinalizacion);

    if (!completada) return res.status(404).json({ error: "Actividad no encontrada" });
    res.json(completada);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al completar actividad" });
  }
};

export const deleteActividad = async (req: Request, res: Response) => {
  try {
    const actividadId = Number(req.params.actividadId);
    if (isNaN(actividadId)) return res.status(400).json({ error: "ID de actividad inválido" });

    const eliminada = await Clientes.eliminarActividad(actividadId);
    if (!eliminada) return res.status(404).json({ error: "Actividad no encontrada" });

    res.json({ message: "Actividad eliminada", actividad: eliminada });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Error al eliminar actividad" });
  }
};

