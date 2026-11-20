import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { router } from './routers.js';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '..', 'public');

app.use(express.json());
app.use('/api', router);
app.use(express.static(publicPath));

app.get('/', (_req, res) => {
  res.sendFile(path.join(publicPath, 'MiniCRM.html'));
});

app.get('/api', (_req, res) => {
  res.json({ mensaje: 'API MiniCRM funcionando' });
});

app.listen(port, () => {
  console.log(`MiniCRM escuchando en http://localhost:${port}`);
});
