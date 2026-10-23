import { Router } from 'express';
import { controladores as c } from './controladores.js';

export const rutasClientes = Router();
rutasClientes.route('/').get(c.listar).post(c.crear);
rutasClientes.route('/:clienteId').get(c.obtener).patch(c.actualizar).delete(c.eliminar);
rutasClientes.route('/:clienteId/actividades').get(c.listarActividades).post(c.crearActividad);
rutasClientes.route('/:clienteId/actividades/:actividadId').get(c.obtenerActividad).patch(c.actualizarActividad).delete(c.eliminarActividad);
rutasClientes.post('/:clienteId/actividades/:actividadId/completar', c.completarActividad);
