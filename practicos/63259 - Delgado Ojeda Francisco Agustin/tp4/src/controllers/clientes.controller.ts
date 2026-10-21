import { Request, Response } from "express";
import { Clientes } from "../services/clientes.service.js";

export class ClientesController {
  static async listar(req: Request, res: Response) {
    try {
      const buscar =
        typeof req.query.buscar === "string"
          ? req.query.buscar
          : typeof req.query.q === "string"
          ? req.query.q
          : undefined;

      const resultado = await Clientes.listar({ buscar });
      res.json(resultado);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Error al listar clientes" });
    }
  }

  static async obtener(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "El ID del cliente debe ser numérico." });
      }

      const cliente = await Clientes.obtener(id);
      if (!cliente) {
        return res.status(404).json({ error: "Cliente no encontrado." });
      }

      res.json(cliente);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Error al obtener cliente" });
    }
  }

  static async crear(req: Request, res: Response) {
    try {
      const { nombre, email, telefono, domicilio } = req.body;
      const nuevo = await Clientes.crear({ nombre, email, telefono, domicilio });
      res.status(201).json(nuevo);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Error al crear cliente" });
    }
  }

  static async actualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "El ID del cliente debe ser numérico." });
      }

      const { nombre, email, telefono, domicilio } = req.body;
      const actualizado = await Clientes.actualizar(id, {
        nombre,
        email,
        telefono,
        domicilio,
      });

      if (!actualizado) {
        return res.status(404).json({ error: "Cliente no encontrado." });
      }

      res.json(actualizado);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Error al actualizar cliente" });
    }
  }

  static async eliminar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "El ID del cliente debe ser numérico." });
      }

      const eliminado = await Clientes.eliminar(id);
      if (!eliminado) {
        return res.status(404).json({ error: "Cliente no encontrado." });
      }

      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Error al eliminar cliente" });
    }
  }

  // --- Actividades ---

  static async agregarActividad(req: Request, res: Response) {
    try {
      const clienteId = Number(req.params.id);
      if (isNaN(clienteId)) {
        return res.status(400).json({ error: "El ID del cliente debe ser numérico." });
      }

      const { descripcion, fecha } = req.body;
      const actividad = await Clientes.agregarActividad(clienteId, { descripcion, fecha });
      res.status(201).json(actividad);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Error al agregar actividad" });
    }
  }

  static async actualizarActividad(req: Request, res: Response) {
    try {
      const clienteId = Number(req.params.id);
      const actividadId = Number(req.params.actividadId);
      if (isNaN(clienteId) || isNaN(actividadId)) {
        return res.status(400).json({ error: "Los identificadores deben ser numéricos." });
      }

      const { descripcion, fecha } = req.body;
      const actividad = await Clientes.actualizarActividad(clienteId, actividadId, {
        descripcion,
        fecha,
      });

      if (!actividad) {
        return res.status(404).json({ error: "Actividad no encontrada." });
      }

      res.json(actividad);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Error al actualizar actividad" });
    }
  }

  static async completarActividad(req: Request, res: Response) {
    try {
      const clienteId = Number(req.params.id);
      const actividadId = Number(req.params.actividadId);
      if (isNaN(clienteId) || isNaN(actividadId)) {
        return res.status(400).json({ error: "Los identificadores deben ser numéricos." });
      }

      const actividad = await Clientes.completarActividad(clienteId, actividadId);
      if (!actividad) {
        return res.status(404).json({ error: "Actividad no encontrada." });
      }

      res.json(actividad);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Error al completar actividad" });
    }
  }

  static async eliminarActividad(req: Request, res: Response) {
    try {
      const clienteId = Number(req.params.id);
      const actividadId = Number(req.params.actividadId);
      if (isNaN(clienteId) || isNaN(actividadId)) {
        return res.status(400).json({ error: "Los identificadores deben ser numéricos." });
      }

      const eliminada = await Clientes.eliminarActividad(clienteId, actividadId);
      if (!eliminada) {
        return res.status(404).json({ error: "Actividad no encontrada." });
      }

      res.status(204).end();
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Error al eliminar actividad" });
    }
  }
}
