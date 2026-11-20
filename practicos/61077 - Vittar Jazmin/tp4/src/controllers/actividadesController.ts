import type { Request, Response } from "express";
import { Clientes } from "../services/Clientes.js";

export async function listarActividades(req: Request, res: Response) {
    try {
        const clienteId = Number(req.params.clienteId);

        if (!Number.isInteger(clienteId) || clienteId <= 0) {
            res.status(400).json({ error: "El ID del cliente no es válido" });
            return;
        }

        const cliente = await Clientes.obtenerPorId(clienteId);

        if (!cliente) {
            res.status(404).json({ error: "Cliente no encontrado" });
            return;
        }

        res.json(await Clientes.listarActividades(clienteId));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se pudieron listar las actividades" });
    }
}

export async function crearActividad(req: Request, res: Response) {
    try {
        const clienteId = Number(req.params.clienteId);
        const { descripcion, fechaCompromiso } = req.body ?? {};

        if (!Number.isInteger(clienteId) || clienteId <= 0) {
            res.status(400).json({ error: "El ID del cliente no es válido" });
            return;
        }

        if (typeof descripcion !== "string" || !descripcion.trim()) {
            res.status(400).json({ error: "La descripción es obligatoria" });
            return;
        }

        if (
            fechaCompromiso !== undefined &&
            fechaCompromiso !== null &&
            fechaCompromiso !== "" &&
            (typeof fechaCompromiso !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(fechaCompromiso) ||
                Number.isNaN(Date.parse(`${fechaCompromiso}T00:00:00Z`)) ||
                new Date(`${fechaCompromiso}T00:00:00Z`).toISOString().slice(0, 10) !== fechaCompromiso)
        ) {
            res.status(400).json({ error: "La fecha de compromiso no es válida" });
            return;
        }

        const actividad = await Clientes.crearActividad(clienteId, {
            descripcion,
            fechaCompromiso: fechaCompromiso || null,
        });

        res.status(201).json(actividad);
    } catch (error) {
        const mensaje =
            error instanceof Error ? error.message : "No se pudo crear la actividad";

        if (mensaje === "No existe el cliente indicado") {
            res.status(404).json({ error: mensaje });
            return;
        }

        res.status(400).json({ error: mensaje });
    }
}

export async function actualizarActividad(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const datos = req.body ?? {};

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ error: "El ID de la actividad no es válido" });
            return;
        }

        if (
            typeof datos !== "object" ||
            Array.isArray(datos) ||
            Object.keys(datos).length === 0 ||
            Object.keys(datos).some(
                (campo) => !["descripcion", "fechaCompromiso"].includes(campo),
            )
        ) {
            res.status(400).json({ error: "Los datos para actualizar no son válidos" });
            return;
        }

        if (
            "descripcion" in datos &&
            (typeof datos.descripcion !== "string" || !datos.descripcion.trim())
        ) {
            res.status(400).json({ error: "La descripción no puede estar vacía" });
            return;
        }

        if (
            "fechaCompromiso" in datos &&
            datos.fechaCompromiso !== null &&
            datos.fechaCompromiso !== "" &&
            (typeof datos.fechaCompromiso !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(datos.fechaCompromiso) ||
                Number.isNaN(Date.parse(`${datos.fechaCompromiso}T00:00:00Z`)) ||
                new Date(`${datos.fechaCompromiso}T00:00:00Z`).toISOString().slice(0, 10) !== datos.fechaCompromiso)
        ) {
            res.status(400).json({ error: "La fecha de compromiso no es válida" });
            return;
        }

        const actividad = await Clientes.actualizarActividad(id, datos);

        if (!actividad) {
            res.status(404).json({ error: "Actividad no encontrada" });
            return;
        }

        res.json(actividad);
    } catch (error) {
        const mensaje =
            error instanceof Error ? error.message : "No se pudo actualizar la actividad";

        if (mensaje.includes("completada")) {
            res.status(409).json({ error: mensaje });
            return;
        }

        res.status(400).json({ error: mensaje });
    }
}

export async function eliminarActividad(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ error: "El ID de la actividad no es válido" });
            return;
        }

        const actividad = await Clientes.eliminarActividad(id);

        if (!actividad) {
            res.status(404).json({ error: "Actividad no encontrada" });
            return;
        }

        res.json({ mensaje: "Actividad eliminada correctamente.", actividad });
    } catch (error) {
        const mensaje =
            error instanceof Error ? error.message : "No se pudo eliminar la actividad";

        if (mensaje.includes("completada")) {
            res.status(409).json({ error: mensaje });
            return;
        }

        res.status(400).json({ error: mensaje });
    }
}

export async function completarActividad(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ error: "El ID de la actividad no es válido" });
            return;
        }

        const actividad = await Clientes.completarActividad(id);

        if (!actividad) {
            res.status(404).json({ error: "Actividad no encontrada" });
            return;
        }

        res.json(actividad);
    } catch (error) {
        const mensaje =
            error instanceof Error ? error.message : "No se pudo completar la actividad";

        if (mensaje.includes("ya está completada")) {
            res.status(409).json({ error: mensaje });
            return;
        }

        res.status(400).json({ error: mensaje });
    }
}