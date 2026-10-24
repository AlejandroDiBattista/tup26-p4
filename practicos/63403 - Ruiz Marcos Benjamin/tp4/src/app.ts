import express from 'express';
import clientesRouter from './routes/clientes.routes';
import { manejarErrores, noEncontrado } from './middlewares/errores';

export const app = express();

app.use(express.json());

app.use('/api/clientes', clientesRouter);

app.use('/api', noEncontrado);
app.use(manejarErrores);
