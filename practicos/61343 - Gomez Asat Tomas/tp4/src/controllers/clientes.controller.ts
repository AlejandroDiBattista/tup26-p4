import {Request, Response} from "express";
import {ClientesService} from "../services/clientes.service";
export const ClientesController = {
    async listar(req: Request, res: Response) {
        try{
            const q = req.query.q as string | undefined;
            const clientes = await ClientesService.listar(q);
            res.status(200).json(clientes);
        } catch (error) {
            res.status(500).json({ error: "Error al listar clientes" });
        }
    },
    async obtenerPorId(req: Request, res: Response) {
        try{
            const id = Number(req.params.id);
            if(isNaN(id)) {
                return res.status(400).json({ error: "ID inválido" });
        }
        const cliente = await ClientesService.obtenerPorId(id);
        if (!cliente) {
            return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.status(200).json(cliente);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener cliente" });
        }
    },
    async crear(req: Request, res: Response) {
        try {
            const { nombre, email, telefono, empresa } = req.body;
            if (!nombre) {
                return res.status(400).json({ error: "El nombre es obligatorio" });
            }
            const cliente = await ClientesService.crear({ nombre, email, telefono, empresa });
            res.status(201).json(cliente);
        } catch (error) {
            res.status(500).json({ error: "Error al crear cliente" });
        }
    },
     async editar(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: "ID inválido" });
            }
            const cliente = await ClientesService.editar(id, req.body);
            if (!cliente) {
                return res.status(404).json({ error: "Cliente no encontrado" });
            }
            res.status(200).json(cliente);
        } catch (error) {
            res.status(500).json({ error: "Error al editar cliente" });
        }
    },
    async eliminar(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: "ID inválido" });
            }
            const cliente = await ClientesService.eliminar(id);
            if (!cliente) {
                return res.status(404).json({ error: "Cliente no encontrado" });
            }
            res.status(200).json(cliente);
        } catch (error) {
            res.status(500).json({ error: "Error al eliminar cliente" });
        }
    },
    async crearActividad(req: Request, res: Response) {
        try {
            const clienteId = Number(req.params.id);
            if (isNaN(clienteId)) {
                return res.status(400).json({ error: "ID de cliente inválido" });
            }
            const { descripcion, fecha } = req.body;
            if (!descripcion || !fecha) {
                return res.status(400).json({ error: "descripcion y fecha son obligatorios" });
            }
            const actividad = await ClientesService.crearActividad({ clienteId, descripcion, fecha });
            res.status(201).json(actividad);
        } catch (error) {
            res.status(500).json({ error: "Error al crear actividad" });
        }
    },
    async editarActividad(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: "ID inválido" });
            }
            const actividad = await ClientesService.editarActividad(id, req.body);
            if (!actividad) {
                return res.status(404).json({ error: "Actividad no encontrada" });
            }
            res.status(200).json(actividad);
        } catch (error) {
            if (error instanceof Error && error.message.includes("completada")) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: "Error al editar actividad" });
        }
    },
    async eliminarActividad(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: "ID inválido" });
            }
            const actividad = await ClientesService.eliminarActividad(id);
            if (!actividad) {
                return res.status(404).json({ error: "Actividad no encontrada" });
            }
            res.status(200).json(actividad);
        } catch (error) {
            if (error instanceof Error && error.message.includes("completada")) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: "Error al eliminar actividad" });
        }
    },
     async marcarCompletada(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: "ID inválido" });
            }
            const { completada } = req.body;
            if (typeof completada !== "boolean") {
                return res.status(400).json({ error: "completada debe ser booleano" });
            }
            const actividad = await ClientesService.marcarCompletada(id, completada);
            if (!actividad) {
                return res.status(404).json({ error: "Actividad no encontrada" });
            }
            res.status(200).json(actividad);
        } catch (error) {
            res.status(500).json({ error: "Error al actualizar actividad" });
        }
    },
};