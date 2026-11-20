import {Router} from 'express';
 import{
    putActividad,
    completarActividad,
    deleteActividad
 } from '../controllers/actividades.controller.js';

 const router = Router();

 //rutas de actividades individuales

 //put
 router.put('/:actividadId',putActividad);
 //patch
 router.patch('/:actividadId/completar', completarActividad);
 //delete
 router.delete('/:actividadId', deleteActividad);

 export default router;
