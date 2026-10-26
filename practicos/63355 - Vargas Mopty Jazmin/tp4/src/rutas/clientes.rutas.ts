import { Router } from 'express';
import * as controlador from '../controladores/clientes.controlador.js';

export const clientesRutas = Router();

clientesRutas.param('id', controlador.validarId);
clientesRutas.param('actividadId', controlador.validarId);

clientesRutas.get('/', controlador.listar);
clientesRutas.get('/:id', controlador.obtenerPorId);
clientesRutas.post('/', controlador.crear);
clientesRutas.put('/:id', controlador.actualizar);
clientesRutas.delete('/:id', controlador.eliminar);
clientesRutas.post('/:id/actividades', controlador.agregarActividad);
clientesRutas.put('/:id/actividades/:actividadId', controlador.actualizarActividad);
clientesRutas.patch('/:id/actividades/:actividadId/completar', controlador.completarActividad);
clientesRutas.delete('/:id/actividades/:actividadId', controlador.eliminarActividad);
