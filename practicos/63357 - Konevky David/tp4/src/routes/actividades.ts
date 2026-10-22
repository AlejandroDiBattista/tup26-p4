import { Router } from 'express';
import { ActividadesController as C } from '../controllers/actividades.js';

// Se monta en /api/clientes/:clienteId/actividades
export const actividadesRouter = Router({ mergeParams: true });

actividadesRouter.get('/', C.listar);
actividadesRouter.post('/', C.crear);
actividadesRouter.put('/:id', C.actualizar);
actividadesRouter.post('/:id/completar', C.completar);
actividadesRouter.delete('/:id', C.eliminar);
