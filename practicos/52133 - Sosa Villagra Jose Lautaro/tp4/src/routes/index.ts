import { Router } from 'express';
import actividadesRoutes from './actividades.routes';
import clientesRoutes from './clientes.routes';

/** Router principal montado en /api. */
export const apiRouter = Router();

apiRouter.use('/clientes', clientesRoutes);
apiRouter.use('/actividades', actividadesRoutes);

apiRouter.use((_req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});
