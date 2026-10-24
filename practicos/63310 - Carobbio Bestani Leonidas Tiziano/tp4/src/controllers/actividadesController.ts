import { Request, Response } from "express";
import { Clientes } from "../services/clientes";

export const crearActividad = (req: Request, res: Response) => {
  try {
    res.status(201).json(Clientes.agregarActividad(Number(req.params.clienteId), req.body));
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "No se pudo crear la actividad." });
  }
};

export const completarActividad = (req: Request, res: Response) => {
  try {
    const actividad = Clientes.completarActividad(Number(req.params.id));
    if (!actividad) return res.status(404).json({ error: "Actividad no encontrada." });
    res.json(actividad);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "No se pudo completar." });
  }
};

export const actualizarActividad = (req: Request, res: Response) => {
  try {
    const actividad = Clientes.actualizarActividad(Number(req.params.id), req.body);
    if (!actividad) return res.status(404).json({ error: "Actividad no encontrada." });
    res.json(actividad);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "No se pudo editar." });
  }
};

export const eliminarActividad = (req: Request, res: Response) => {
  try {
    const eliminada = Clientes.eliminarActividad(Number(req.params.id));
    if (!eliminada) return res.status(404).json({ error: "Actividad no encontrada." });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "No se pudo eliminar." });
  }
};
