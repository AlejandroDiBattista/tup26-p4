import express from 'express';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDb } from './db.js';
import clientesRouter from './clientes.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CARPETA_PUBLIC = resolve(__dirname, '../public');

const app = express();
const PUERTO = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json());

// Servir archivos estáticos desde public/
app.use(express.static(CARPETA_PUBLIC));

// Redireccionar raíz a /MiniCRM.html
app.get('/', (_req, res) => {
  res.redirect('/MiniCRM.html');
});

// Montar router de la API REST
app.use('/api/clientes', clientesRouter);

// Inicializar base de datos y arrancar el servidor
await initDb();

app.listen(PUERTO, () => {
  console.log(`MiniCRM escuchando en http://localhost:${PUERTO}`);
});

export default app;
