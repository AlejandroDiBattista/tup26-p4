import { Router } from 'express';
import clientesRouter from './clientes.routes';
import actividadesRouter from './actividades.routes';

const apiRouter = Router();

apiRouter.use('/clientes', clientesRouter);
apiRouter.use('/actividades', actividadesRouter);

export default apiRouter;
