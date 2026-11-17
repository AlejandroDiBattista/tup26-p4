import { Router } from 'express';
import * as actividades from '../controladores/actividades.ts';

export const rutasDeActividades = Router();

rutasDeActividades.put('/:id', actividades.actualizar);
rutasDeActividades.patch('/:id/completar', actividades.completar);
rutasDeActividades.delete('/:id', actividades.eliminar);
