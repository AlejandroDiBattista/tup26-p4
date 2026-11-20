import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { sembrarBaseDeDatos } from './db/index.js';
import { clientesRouter } from './rutas/clientes.rutas.js';

sembrarBaseDeDatos();

const app = express();
const puerto = Number(process.env.PORT) || 3000;
const directorioActual = path.dirname(fileURLToPath(import.meta.url));
const rutaPublic = path.resolve(directorioActual, '../public');

app.use(express.json());
app.use(express.static(rutaPublic));

app.use('/api/clientes', clientesRouter);

app.get('/', (_req, res) => {
  res.sendFile(path.join(rutaPublic, 'MiniCRM.html'));
});

app.listen(puerto, () => {
  console.log(`Servidor MiniCRM en ejecución en http://localhost:${puerto}`);
});
