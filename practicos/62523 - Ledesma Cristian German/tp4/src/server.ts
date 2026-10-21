import express, { type NextFunction, type Request, type Response } from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { actividadesRouter } from './routes/actividades.js';
import { clientesRouter } from './routes/clientes.js';

const app = express();
const puerto = Number(process.env.PORT ?? 3000);
const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), '../public');

app.use(express.json());
app.use('/api/clientes', clientesRouter);
app.use('/api/actividades', actividadesRouter);
app.use(express.static(publicDir));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const mensaje = error instanceof Error ? error.message : 'Error interno del servidor.';
  res.status(400).json({ error: mensaje });
});

app.listen(puerto, () => {
  console.log(`MiniCRM escuchando en http://localhost:${puerto}`);
});
