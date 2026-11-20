import { Router } from 'express';
import * as controlador from '../controllers/actividades.controller.ts';

export const rutasActividades = Router();

rutasActividades.put('/:id', controlador.actualizar);
rutasActividades.post('/:id/completar', controlador.completar);
rutasActividades.delete('/:id', controlador.eliminar);