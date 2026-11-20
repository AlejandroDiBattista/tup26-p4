import type { Request, Response } from "express";
import { Clientes } from "./clientes.js";

function responderError(res: Response, error: unknown) {
    const mensaje = (error as Error).message;
    const codigo = mensaje.includes("no encontrad") ? 404 : 400;
    res.status(codigo).json({ error: mensaje });
}

export function listar(req: Request, res: Response) {
    const texto = typeof req.query.q === "string" ? req.query.q : "";
    res.json(Clientes.listar(texto));
}

export function obtener(req: Request, res: Response) {
    try {
        res.json(Clientes.obtener(Number(req.params.id)));
    } catch (error) {
        responderError(res, error);
    }
}

export function crear(req: Request, res: Response) {
    try {
        res.status(201).json(Clientes.crear(req.body));
    } catch (error) {
        responderError(res, error);
    }
}

export function actualizar(req: Request, res: Response) {
    try {
        res.json(Clientes.actualizar(Number(req.params.id), req.body));
    } catch (error) {
        responderError(res, error);
    }
}

export function eliminar(req: Request, res: Response) {
    try {
        Clientes.eliminar(Number(req.params.id));
        res.status(204).end();
    } catch (error) {
        responderError(res, error);
    }
}

export function agregarActividad(req: Request, res: Response) {
    try {
        const actividad = Clientes.agregarActividad(Number(req.params.id), req.body);
        res.status(201).json(actividad);
    } catch (error) {
        responderError(res, error);
    }
}

export function editarActividad(req: Request, res: Response) {
    try {
        res.json(Clientes.editarActividad(Number(req.params.id), req.body));
    } catch (error) {
        responderError(res, error);
    }
}

export function completarActividad(req: Request, res: Response) {
    try {
        res.json(Clientes.completarActividad(Number(req.params.id)));
    } catch (error) {
        responderError(res, error);
    }
}

export function eliminarActividad(req: Request, res: Response) {
    try {
        Clientes.eliminarActividad(Number(req.params.id));
        res.status(204).end();
    } catch (error) {
        responderError(res, error);
    }
}