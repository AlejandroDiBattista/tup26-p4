import { Router } from 'express';
import * as controlador from '../controllers/actividades.js';

export const actividadesRouter = Router();

actividadesRouter.put('/:id', controlador.actualizar);
actividadesRouter.patch('/:id/completar', controlador.completar);
actividadesRouter.delete('/:id', controlador.eliminar);
