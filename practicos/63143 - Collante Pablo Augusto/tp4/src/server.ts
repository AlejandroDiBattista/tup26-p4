import express from 'express';
import { fileURLToPath } from 'node:url';
import { clientesRouter } from './routes/clientesRouter.js';
import { ErrorDeNegocio } from './services/Clientes.js';

const app = express();
const publicDir = fileURLToPath(new URL('../public/', import.meta.url));

app.use(express.json());
app.use('/api/clientes', clientesRouter);
app.use(express.static(publicDir));
app.get('/', (_req, res) => res.redirect('/MiniCRM.html'));
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ErrorDeNegocio) return res.status(error.status).json({ error: error.message });
  if (error instanceof SyntaxError && 'status' in error) return res.status(400).json({ error: 'JSON inválido.' });
  console.error(error);
  return res.status(500).json({ error: 'Error interno del servidor.' });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`MiniCRM: http://localhost:${port}/MiniCRM.html`));
