import type { Request, Response } from 'express';
import { Clientes } from '../servicios/clientes.ts';

export async function listar(pedido: Request, respuesta: Response) {
  respuesta.json(await Clientes.listar(String(pedido.query.buscar ?? '')));
}

export async function obtener(pedido: Request, respuesta: Response) {
  respuesta.json(await Clientes.obtener(Number(pedido.params.id)));
}

export async function crear(pedido: Request, respuesta: Response) {
  respuesta.json(await Clientes.crear(pedido.body));
}

export async function actualizar(pedido: Request, respuesta: Response) {
  respuesta.json(await Clientes.actualizar(Number(pedido.params.id), pedido.body));
}

export async function eliminar(pedido: Request, respuesta: Response) {
  await Clientes.eliminar(Number(pedido.params.id));
  respuesta.end();
}
