import { Router } from 'express';
import * as actividades from '../controladores/actividades';

// mergeParams permite leer :clienteId, definido en el router de clientes.
export const rutasActividades = Router({ mergeParams: true });

rutasActividades.get('/', actividades.listar);
rutasActividades.post('/', actividades.crear);
rutasActividades.get('/:actividadId', actividades.obtener);
rutasActividades.patch('/:actividadId', actividades.actualizar);
rutasActividades.delete('/:actividadId', actividades.eliminar);
rutasActividades.post('/:actividadId/completar', actividades.completar);
