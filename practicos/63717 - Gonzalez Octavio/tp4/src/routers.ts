import { Router } from 'express';
import { clientesController, actividadesController } from './controllers.js';

export const router = Router();

// Rutas de Clientes
router.get('/clientes', clientesController.listar);
router.post('/clientes', clientesController.crear);
router.get('/clientes/:id', clientesController.obtener);
router.put('/clientes/:id', clientesController.actualizar);
router.delete('/clientes/:id', clientesController.eliminar);

// Rutas de Actividades por Cliente
router.get('/clientes/:clienteId/actividades', actividadesController.listar);
router.post('/clientes/:clienteId/actividades', actividadesController.crear);

// Rutas individuales de Actividades
router.put('/actividades/:id', actividadesController.editar);
router.patch('/actividades/:id/completar', actividadesController.completar);
router.post('/actividades/:id/completar', actividadesController.completar); // Soporta PATCH y POST para compatibilidad
router.delete('/actividades/:id', actividadesController.eliminar);
