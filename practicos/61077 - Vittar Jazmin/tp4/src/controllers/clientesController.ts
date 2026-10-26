import type { Request, Response } from "express";
import { Clientes } from "../services/Clientes.js";

export async function listarClientes(req: Request, res: Response) {
    try {
        const termino =
            typeof req.query.q === "string" ? req.query.q : "";

        const resultado = await Clientes.buscar(termino);
        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se pudieron listar los clientes" });
    }
}

export async function obtenerCliente(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ error: "El ID del cliente no es válido" });
            return;
        }

        const cliente = await Clientes.obtenerPorId(id);

        if (!cliente) {
            res.status(404).json({ error: "Cliente no encontrado" });
            return;
        }

        res.json(cliente);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se pudo obtener el cliente" });
    }
}

export async function crearCliente(req: Request, res: Response) {
    try {
        const { nombre, apellido, email } = req.body ?? {};

        if (
            typeof nombre !== "string" ||
            !nombre.trim() ||
            typeof apellido !== "string" ||
            !apellido.trim() ||
            typeof email !== "string" ||
            !email.trim()
        ) {
            res.status(400).json({
                error: "Nombre, apellido y correo electrónico son obligatorios",
            });
            return;
        }

        const cliente = await Clientes.crear({
            nombre,
            apellido,
            email,
            domicilio: req.body.domicilio,
            localidad: req.body.localidad,
            telefono: req.body.telefono,
        });

        res.status(201).json(cliente);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se pudo crear el cliente" });
    }
}

export async function actualizarCliente(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ error: "El ID del cliente no es válido" });
            return;
        }

        const datos = req.body ?? {};

        if (
            typeof datos !== "object" ||
            Array.isArray(datos) ||
            Object.keys(datos).length === 0
        ) {
            res.status(400).json({ error: "No se recibieron datos para actualizar" });
            return;
        }

        const camposPermitidos = [
            "nombre",
            "apellido",
            "email",
            "domicilio",
            "localidad",
            "telefono",
        ];

        if (Object.keys(datos).some((campo) => !camposPermitidos.includes(campo))) {
            res.status(400).json({ error: "Se recibieron campos no permitidos" });
            return;
        }

        for (const campo of ["nombre", "apellido", "email"]) {
            if (
                campo in datos &&
                (typeof datos[campo] !== "string" || !datos[campo].trim())
            ) {
                res.status(400).json({ error: `El campo ${campo} no puede estar vacío` });
                return;
            }
        }

        for (const campo of ["domicilio", "localidad", "telefono"]) {
            if (
                campo in datos &&
                datos[campo] !== null &&
                typeof datos[campo] !== "string"
            ) {
                res.status(400).json({ error: `El campo ${campo} no es válido` });
                return;
            }
        }

        const cliente = await Clientes.actualizar(id, datos);

        if (!cliente) {
            res.status(404).json({ error: "Cliente no encontrado" });
            return;
        }

        res.json(cliente);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se pudo actualizar el cliente" });
    }
}

export async function eliminarCliente(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({ error: "El ID del cliente no es válido" });
            return;
        }

        const cliente = await Clientes.eliminar(id);

        if (!cliente) {
            res.status(404).json({ error: "Cliente no encontrado" });
            return;
        }

        res.json({ mensaje: "Cliente eliminado correctamente.", cliente });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se pudo eliminar el cliente" });
    }
}