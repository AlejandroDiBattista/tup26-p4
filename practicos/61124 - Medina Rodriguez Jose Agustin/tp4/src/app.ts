import express from 'express';
import path from 'node:path';
import { api } from './routes/index.ts';
import { noEncontrado, manejarErrores } from './middlewares/errores.ts';

const app = express();

const carpetaPublica = path.join(import.meta.dirname, '..', 'public');

app.use(express.json());
app.use(express.static(carpetaPublica));

app.get('/', (req, res) => {
  res.redirect('/MiniCRM.html');
});

app.use('/api', api);

app.use(noEncontrado);
app.use(manejarErrores);

export { app };