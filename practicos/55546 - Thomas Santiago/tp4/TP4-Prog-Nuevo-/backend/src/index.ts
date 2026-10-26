import cors from 'cors';
import express from 'express';

import { initializeDatabase } from './db.js';
import clientesRoutes from './routes/clientes.routes.js';

const app = express();
const port = Number(process.env.PORT ?? 3000);

initializeDatabase();

app.use(cors());
app.use(express.json());
app.use('/api', clientesRoutes);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'MiniCRM API' });
});

app.listen(port, () => {
  console.log(`MiniCRM API escuchando en http://localhost:${port}`);
});
