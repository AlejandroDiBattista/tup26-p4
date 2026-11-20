import express from 'express';
import { clientesRouter } from './routes/clientes.js';
import { manejarErrores } from './middleware/errores.js';

export const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use('/api/clientes', clientesRouter);
app.use(manejarErrores);
