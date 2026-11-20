import { Router } from 'express';
import type { Database } from '../db/connection.js';
import { actividadesController } from '../controllers/actividades.js';

export function actividadesRouter(db: Database) {
  const router = Router({ mergeParams: true });
  const controller = actividadesController(db);
  router.route('/').get(controller.buscar).post(controller.crear);
  router.route('/:actividadId').get(controller.obtener).patch(controller.actualizar).delete(controller.eliminar);
  router.post('/:actividadId/completar', controller.completar);
  return router;
}
