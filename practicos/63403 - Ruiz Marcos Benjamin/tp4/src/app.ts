import express from 'express';
import { fileURLToPath } from 'node:url';
import clientesRouter from './routes/clientes.routes';
import { manejarErrores, noEncontrado } from './middlewares/errores';

const carpetaPublica = fileURLToPath(new URL('../public', import.meta.url));

export const app = express();

app.use(express.json());

// Página web
app.use(express.static(carpetaPublica));
app.get('/', (_req, res) => res.redirect('/MiniCRM.html'));

// API REST
app.use('/api/clientes', clientesRouter);

app.use('/api', noEncontrado);
app.use(manejarErrores);
