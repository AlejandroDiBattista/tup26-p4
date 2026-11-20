import { Router } from 'express';
import * as api from '../controladores/api.js';

export const rutasApi = Router();
rutasApi.get('/clientes', (req, res, next) =>
  req.query.q !== undefined
    ? api.buscarClientes(req, res, next)
    : api.listarClientes(req, res, next),
);
rutasApi.post('/clientes', api.crearCliente);
rutasApi.get('/clientes/:clienteId', api.obtenerCliente);
rutasApi.put('/clientes/:clienteId', api.actualizarCliente);
rutasApi.delete('/clientes/:clienteId', api.eliminarCliente);
rutasApi.get('/clientes/:clienteId/actividades', api.listarActividades);
rutasApi.post('/clientes/:clienteId/actividades', api.crearActividad);
rutasApi.put(
  '/clientes/:clienteId/actividades/:actividadId',
  api.actualizarActividad,
);
rutasApi.delete(
  '/clientes/:clienteId/actividades/:actividadId',
  api.eliminarActividad,
);
rutasApi.post(
  '/clientes/:clienteId/actividades/:actividadId/completar',
  api.completarActividad,
);
