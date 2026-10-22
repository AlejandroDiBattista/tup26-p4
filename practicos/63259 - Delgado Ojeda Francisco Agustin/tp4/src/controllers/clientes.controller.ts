import { Request, Response } from "express";
import { Clientes } from "../services/clientes.service.js";

export class ClientesController {
  static async listar(req: Request, res: Response) {
    try {
      const buscar = typeof req.query.buscar === "string" ? req.query.buscar : undefined;
      const resultado = await Clientes.listar({ buscar });
      res.json(resultado);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async obtener(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });

      const cliente = await Clientes.obtener(id);
      if (!cliente) return res.status(404).json({ error: "Cliente no encontrado." });

      res.json(cliente);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async crear(req: Request, res: Response) {
    try {
      const nuevo = await Clientes.crear(req.body);
      res.status(201).json(nuevo);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async actualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });

      const actualizado = await Clientes.actualizar(id, req.body);
      if (!actualizado) return res.status(404).json({ error: "Cliente no encontrado." });

      res.json(actualizado);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async eliminar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });

      const eliminado = await Clientes.eliminar(id);
      if (!eliminado) return res.status(404).json({ error: "Cliente no encontrado." });

      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async agregarActividad(req: Request, res: Response) {
    try {
      const clienteId = Number(req.params.id);
      if (isNaN(clienteId)) return res.status(400).json({ error: "ID inválido." });

      const actividad = await Clientes.agregarActividad(clienteId, req.body);
      res.status(201).json(actividad);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async actualizarActividad(req: Request, res: Response) {
    try {
      const clienteId = Number(req.params.id);
      const actividadId = Number(req.params.actividadId);
      if (isNaN(clienteId) || isNaN(actividadId)) {
        return res.status(400).json({ error: "ID inválido." });
      }

      const actividad = await Clientes.actualizarActividad(clienteId, actividadId, req.body);
      if (!actividad) return res.status(404).json({ error: "Actividad no encontrada." });

      res.json(actividad);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async completarActividad(req: Request, res: Response) {
    try {
      const clienteId = Number(req.params.id);
      const actividadId = Number(req.params.actividadId);
      if (isNaN(clienteId) || isNaN(actividadId)) {
        return res.status(400).json({ error: "ID inválido." });
      }

      const actividad = await Clientes.completarActividad(clienteId, actividadId);
      if (!actividad) return res.status(404).json({ error: "Actividad no encontrada." });

      res.json(actividad);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async eliminarActividad(req: Request, res: Response) {
    try {
      const clienteId = Number(req.params.id);
      const actividadId = Number(req.params.actividadId);
      if (isNaN(clienteId) || isNaN(actividadId)) {
        return res.status(400).json({ error: "ID inválido." });
      }

      const eliminada = await Clientes.eliminarActividad(clienteId, actividadId);
      if (!eliminada) return res.status(404).json({ error: "Actividad no encontrada." });

      res.status(204).end();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
