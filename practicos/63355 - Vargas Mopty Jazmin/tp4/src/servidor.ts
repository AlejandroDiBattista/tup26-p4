import express, { type ErrorRequestHandler } from 'express';
import { fileURLToPath } from 'node:url';
import { sembrarBaseDeDatos } from './db/index.js';
import { clientesRutas } from './rutas/clientes.rutas.js';

sembrarBaseDeDatos();

export const app = express();
const carpetaPublica = fileURLToPath(new URL('../public', import.meta.url));

app.use(express.json());
app.use('/api/clientes', clientesRutas);
app.use(express.static(carpetaPublica));
app.get('/', (_req, res) => {
  res.sendFile('MiniCRM.html', { root: carpetaPublica });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado.' });
});

const manejarError: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const estado = [400, 404, 413].includes(error.status) ? error.status : 500;
  const mensajes: Record<number, string> = {
    400: 'El cuerpo de la solicitud debe contener JSON válido.',
    404: 'Recurso no encontrado.',
    413: 'El cuerpo de la solicitud supera el tamaño permitido.',
    500: 'Ocurrió un error interno del servidor.',
  };

  res.status(estado).json({ error: mensajes[estado] });
};

app.use(manejarError);

const puerto = Number(process.env.PORT ?? 3000);
export const servidor = app.listen(puerto, () => {
  console.log(`MiniCRM disponible en http://localhost:${puerto}`);
});
