import type { Request, Response } from "express";
import { Clientes } from "../services/Clientes.js";

function idDe(req: Request): number {
  return Number(req.params.id);
}

export const clientesController = {
  async listar(req: Request, res: Response): Promise<void> {
    const busqueda = typeof req.query.q === "string" ? req.query.q : undefined;
    res.json(await Clientes.listar(busqueda));
  },

  async obtener(req: Request, res: Response): Promise<void> {
    const cliente = await Clientes.obtener(idDe(req));
    if (!cliente) {
      res.status(404).json({ error: "Cliente no encontrado" });
      return;
    }
    res.json(cliente);
  },

  async crear(req: Request, res: Response): Promise<void> {
    const { nombre, email } = req.body ?? {};
    if (!nombre || !email) {
      res.status(400).json({ error: "nombre y email son obligatorios" });
      return;
    }
    res.status(201).json(await Clientes.crear(req.body));
  },

  async editar(req: Request, res: Response): Promise<void> {
    const cliente = await Clientes.editar(idDe(req), req.body ?? {});
    if (!cliente) {
      res.status(404).json({ error: "Cliente no encontrado" });
      return;
    }
    res.json(cliente);
  },

  async eliminar(req: Request, res: Response): Promise<void> {
    if (!(await Clientes.eliminar(idDe(req)))) {
      res.status(404).json({ error: "Cliente no encontrado" });
      return;
    }
    res.status(204).end();
  },

  async actividades(req: Request, res: Response): Promise<void> {
    res.json(await Clientes.actividades(idDe(req)));
  },

  async crearActividad(req: Request, res: Response): Promise<void> {
    const { descripcion } = req.body ?? {};
    if (!descripcion) {
      res.status(400).json({ error: "descripcion es obligatoria" });
      return;
    }
    const actividad = await Clientes.agregarActividad(idDe(req), req.body);
    if (!actividad) {
      res.status(404).json({ error: "Cliente no encontrado" });
      return;
    }
    res.status(201).json(actividad);
  },

  async editarActividad(req: Request, res: Response): Promise<void> {
    const actividad = await Clientes.editarActividad(idDe(req), req.body ?? {});
    if (!actividad) {
      res.status(404).json({ error: "Actividad no encontrada o completada" });
      return;
    }
    res.json(actividad);
  },

  async completarActividad(req: Request, res: Response): Promise<void> {
    const actividad = await Clientes.completarActividad(idDe(req));
    if (!actividad) {
      res.status(404).json({ error: "Actividad no encontrada" });
      return;
    }
    res.json(actividad);
  },

  async eliminarActividad(req: Request, res: Response): Promise<void> {
    if (!(await Clientes.eliminarActividad(idDe(req)))) {
      res.status(404).json({ error: "Actividad no encontrada o completada" });
      return;
    }
    res.status(204).end();
  },
};
