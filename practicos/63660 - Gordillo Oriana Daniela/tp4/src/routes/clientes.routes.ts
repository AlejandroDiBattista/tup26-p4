import { Router } from 'express';
import { ClientesController } from '../controllers/clientes.controller.js';

const router = Router();

// Rutas de clientes
router.get('/clientes', ClientesController.listar);
router.get('/clientes/:id', ClientesController.obtenerPorId);
router.post('/clientes', ClientesController.crear);
router.put('/clientes/:id', ClientesController.actualizar);
router.delete('/clientes/:id', ClientesController.eliminar);

// Rutas de actividades anidadas
router.get('/clientes/:clienteId/actividades', ClientesController.listarActividades);
router.post('/clientes/:clienteId/actividades', ClientesController.crearActividad);
router.put('/clientes/:clienteId/actividades/:actividadId', ClientesController.actualizarActividad);
router.delete('/clientes/:clienteId/actividades/:actividadId', ClientesController.borrarActividad);

// Completar actividad (soporta tanto PUT como POST para flexibilidad)
router.put('/clientes/:clienteId/actividades/:actividadId/completar', ClientesController.completarActividad);
router.post('/clientes/:clienteId/actividades/:actividadId/completar', ClientesController.completarActividad);

export default router;
