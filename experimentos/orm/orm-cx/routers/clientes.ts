import { Router } from 'express';
import { actualizarActividad, actualizarCliente, buscarClientes, completarActividad, crearActividad, crearCliente, eliminarActividad, eliminarCliente, listarActividades, listarActividadesPendientes, listarActividadesSinCompromiso, listarActividadesVencidas, listarClientes, obtenerActividad, obtenerCliente } from '../manejadores/clientes.js';

export const clientesRouter = Router();

clientesRouter.get('/buscar', buscarClientes);
clientesRouter.get('/', listarClientes);
clientesRouter.get('/:id', obtenerCliente);
clientesRouter.post('/', crearCliente);
clientesRouter.patch('/:id', actualizarCliente);
clientesRouter.delete('/:id', eliminarCliente);
clientesRouter.get('/:clienteId/actividades', listarActividades);
clientesRouter.get('/:clienteId/actividades/pendientes', listarActividadesPendientes);
clientesRouter.get('/:clienteId/actividades/vencidas', listarActividadesVencidas);
clientesRouter.get('/:clienteId/actividades/sin-compromiso', listarActividadesSinCompromiso);
clientesRouter.get('/:clienteId/actividades/:actividadId', obtenerActividad);
clientesRouter.post('/:clienteId/actividades', crearActividad);
clientesRouter.patch('/:clienteId/actividades/:actividadId', actualizarActividad);
clientesRouter.post('/:clienteId/actividades/:actividadId/completar', completarActividad);
clientesRouter.delete('/:clienteId/actividades/:actividadId', eliminarActividad);
