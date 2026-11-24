import type { Request, Response } from 'express';
import { Clientes } from '../services/Clientes.js';
import { campos, ErrorHttp, id } from './validacion.js';

const requeridos = ['nombre', 'apellido', 'email'];
const opcionales = ['telefono', 'empresa', 'notas'];

export async function listar(req: Request, res: Response) {
    const { q } = req.query;
    if (q !== undefined && typeof q !== 'string') throw new ErrorHttp(400, 'La búsqueda debe ser texto.');
    res.json(q === undefined ? await Clientes.getAll() : await Clientes.search(q));
}

export async function obtener(req: Request, res: Response) {
    const cliente = await Clientes.getById(id(req));
    if (!cliente) throw new ErrorHttp(404, 'Cliente inexistente.');
    res.json(cliente);
}

export async function crear(req: Request, res: Response) {
    const datos = campos(req, requeridos, opcionales);
    const { nombre, apellido, email, telefono, empresa, notas } = datos;
    res.status(201).json(await Clientes.create({
        nombre: nombre!, apellido: apellido!, email: email!, telefono, empresa, notas,
    }));
}

export async function actualizar(req: Request, res: Response) {
    const clienteId = id(req);
    const { nombre, apellido, email, telefono, empresa, notas } = campos(req, requeridos, opcionales, true);
    const cliente = await Clientes.update(clienteId, {
        nombre: nombre ?? undefined, apellido: apellido ?? undefined, email: email ?? undefined,
        telefono, empresa, notas,
    });
    if (!cliente) throw new ErrorHttp(404, 'Cliente inexistente.');
    res.json(cliente);
}

export async function eliminar(req: Request, res: Response) {
    if (!await Clientes.delete(id(req))) throw new ErrorHttp(404, 'Cliente inexistente.');
    res.sendStatus(204);
}
