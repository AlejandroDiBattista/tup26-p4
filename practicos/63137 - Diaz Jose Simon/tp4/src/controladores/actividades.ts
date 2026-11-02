import type { Request, Response } from 'express';
import { Actividades } from '../servicios/actividades.ts';

export async function crear(pedido: Request, respuesta: Response) {
  respuesta.json(await Actividades.crear(Number(pedido.params.id), pedido.body));
}

export async function actualizar(pedido: Request, respuesta: Response) {
  respuesta.json(await Actividades.actualizar(Number(pedido.params.id), pedido.body));
}

export async function completar(pedido: Request, respuesta: Response) {
  respuesta.json(await Actividades.completar(Number(pedido.params.id)));
}

export async function eliminar(pedido: Request, respuesta: Response) {
  await Actividades.eliminar(Number(pedido.params.id));
  respuesta.end();
}
