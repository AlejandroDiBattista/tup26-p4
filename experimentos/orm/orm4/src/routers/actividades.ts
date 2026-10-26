import { Router } from 'express';
import { ActividadesHandler } from '../handlers/actividades.js';

export const actividadesRouter = Router();

actividadesRouter.get('/', ActividadesHandler.listar);
actividadesRouter.get('/:id', ActividadesHandler.obtener);
actividadesRouter.post('/', ActividadesHandler.crear);
actividadesRouter.put('/:id', ActividadesHandler.actualizar);
actividadesRouter.delete('/:id', ActividadesHandler.eliminar);
