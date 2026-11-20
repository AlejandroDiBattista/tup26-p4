import express, { type NextFunction, type Request, type Response } from 'express';
import { iniciarDB } from './db/index.ts';
import { clientesRouter } from './routes/clientes.routes.ts';
import { ErrorNegocio } from './services/clientes.service.ts';

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.get('/', (_req, res) => res.redirect('/MiniCRM.html'));
app.use('/api/clientes', clientesRouter);

// Express 5 propaga los errores de los handlers async hasta acá.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ErrorNegocio) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

await iniciarDB();
const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => console.log(`MiniCRM en http://localhost:${PORT}`));
