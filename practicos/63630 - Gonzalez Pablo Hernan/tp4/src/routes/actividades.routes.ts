import { Router } from 'express';
import * as actividades from '../controllers/actividades.controller.ts';

export const actividadesRouter = Router({ mergeParams: true });

actividadesRouter.post('/', actividades.agregar);
actividadesRouter.put('/:actividadId', actividades.editar);
actividadesRouter.patch('/:actividadId/completar', actividades.completar);
actividadesRouter.delete('/:actividadId', actividades.eliminar);
