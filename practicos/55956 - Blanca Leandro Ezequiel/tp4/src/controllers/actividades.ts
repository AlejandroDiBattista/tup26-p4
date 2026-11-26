import type { Request, Response } from 'express';
import { Actividades } from '../services/Actividades.js';
import { Clientes } from '../services/Clientes.js';
import { campos, ErrorHttp, id } from './validacion.js';

async function clienteExistente(req: Request) {
    const clienteId = id(req);
    if (!await Clientes.getById(clienteId)) throw new ErrorHttp(404, 'Cliente inexistente.');
    return clienteId;
}

async function actividadNoModificada(actividadId: number): Promise<never> {
    if (!await Actividades.getById(actividadId)) throw new ErrorHttp(404, 'Actividad inexistente.');
    throw new ErrorHttp(409, 'La actividad ya está completada.');
}

export async function listar(req: Request, res: Response) {
    res.json(await Actividades.getByClienteId(await clienteExistente(req)));
}

export async function crear(req: Request, res: Response) {
    const clienteId = await clienteExistente(req);
    const { titulo, descripcion, fecha } = campos(req, ['titulo'], ['descripcion', 'fecha']);
    try {
        res.status(201).json(await Actividades.create(clienteId, { titulo: titulo!, descripcion, fecha }));
    } catch (error) {
        if (!await Clientes.getById(clienteId)) throw new ErrorHttp(404, 'Cliente inexistente.');
        throw error;
    }
}

export async function actualizar(req: Request, res: Response) {
    const actividadId = id(req);
    const { titulo, descripcion, fecha } = campos(req, ['titulo'], ['descripcion', 'fecha'], true);
    const actividad = await Actividades.update(actividadId, { titulo: titulo ?? undefined, descripcion, fecha });
    res.json(actividad ?? await actividadNoModificada(actividadId));
}

export async function completar(req: Request, res: Response) {
    const actividadId = id(req);
    const actividad = await Actividades.complete(actividadId);
    res.json(actividad ?? await actividadNoModificada(actividadId));
}

export async function eliminar(req: Request, res: Response) {
    const actividadId = id(req);
    if (!await Actividades.delete(actividadId)) await actividadNoModificada(actividadId);
    res.sendStatus(204);
}
