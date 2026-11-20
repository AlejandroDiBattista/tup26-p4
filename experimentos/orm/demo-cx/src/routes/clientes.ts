import { Router } from 'express';
import type { Database } from '../db/connection.js';
import { clientesController } from '../controllers/clientes.js';
import { actividadesRouter } from './actividades.js';

export function clientesRouter(db: Database) {
  const router = Router();
  const controller = clientesController(db);
  router.route('/').get(controller.buscar).post(controller.crear);
  router.route('/:clienteId').get(controller.obtener).patch(controller.actualizar).delete(controller.eliminar);
  router.use('/:clienteId/actividades', actividadesRouter(db));
  return router;
}
