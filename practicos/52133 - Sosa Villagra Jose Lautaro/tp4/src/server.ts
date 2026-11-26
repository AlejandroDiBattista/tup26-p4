import express, { type ErrorRequestHandler } from 'express';
import path from 'node:path';
import './db';
import { apiRouter } from './routes';

const app = express();

app.use(express.json());

// API REST
app.use('/api', apiRouter);

// Interfaz web estática (public/MiniCRM.html)
app.use(
  express.static(path.join(__dirname, '..', 'public'), {
    index: 'MiniCRM.html',
  }),
);

// Errores de parseo de JSON u otros no controlados.
const manejadorErrores: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof SyntaxError) {
    res.status(400).json({ error: 'JSON inválido en el cuerpo de la petición' });
    return;
  }
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
};

app.use(manejadorErrores);

const puerto = Number(process.env.PORT) || 3000;

const servidor = app.listen(puerto, () => {
  console.log(`MiniCRM disponible en http://localhost:${puerto}`);
});

servidor.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `El puerto ${puerto} ya está en uso. Probá con otro, por ejemplo: PORT=3001 npm run dev`,
    );
  } else {
    console.error(error);
  }
  process.exit(1);
});
