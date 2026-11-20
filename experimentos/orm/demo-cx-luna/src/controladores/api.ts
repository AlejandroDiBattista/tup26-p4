import type { NextFunction, Request, Response } from 'express';
import { Clientes } from '../servicios/clientes.js';

const numero = (dato: string | string[]) => {
  const valor = Array.isArray(dato) ? dato[0] : dato;
  const n = Number(valor);
  if (!Number.isInteger(n) || n < 1)
    throw new Error('El id debe ser un entero positivo.');
  return n;
};
const ejecutar =
  (fn: (req: Request) => unknown, estado = 200) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const resultado = fn(req);
      if (resultado === undefined || resultado === null)
        return res.status(404).json({ error: 'No encontrado.' });
      res.status(estado).json(resultado);
    } catch (error) {
      next(error);
    }
  };

export const listarClientes = ejecutar(() => Clientes.listar());
export const buscarClientes = ejecutar((req) =>
  Clientes.buscar(String(req.query.q ?? '')),
);
export const obtenerCliente = ejecutar((req) =>
  Clientes.buscarPorId(numero(req.params.clienteId)),
);
export const crearCliente = ejecutar((req) => Clientes.crear(req.body), 201);
export const actualizarCliente = ejecutar((req) =>
  Clientes.actualizar(numero(req.params.clienteId), req.body),
);
export const eliminarCliente = ejecutar((req) =>
  Clientes.eliminar(numero(req.params.clienteId)),
);
export const listarActividades = ejecutar((req) =>
  Clientes.listarActividades(numero(req.params.clienteId)),
);
export const crearActividad = ejecutar(
  (req) => Clientes.crearActividad(numero(req.params.clienteId), req.body),
  201,
);
export const actualizarActividad = ejecutar((req) =>
  Clientes.actualizarActividad(
    numero(req.params.clienteId),
    numero(req.params.actividadId),
    req.body,
  ),
);
export const eliminarActividad = ejecutar((req) =>
  Clientes.eliminarActividad(
    numero(req.params.clienteId),
    numero(req.params.actividadId),
  ),
);
export const completarActividad = ejecutar((req) =>
  Clientes.completarActividad(
    numero(req.params.clienteId),
    numero(req.params.actividadId),
  ),
);
