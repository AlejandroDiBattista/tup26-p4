import express from 'express'; import path from 'node:path'; import {fileURLToPath} from 'node:url'; import {router} from './routers.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api',router); app.use(express.static(path.join(path.dirname(fileURLToPath(import.meta.url)),'..','public')));
app.get('/', (_request, response) => response.sendFile(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'MiniCRM.html')));

app.get('/api', (_request, response) => {
  response.json({ mensaje: 'API MiniCRM funcionando' });
});

app.listen(port, () => {
  console.log(`MiniCRM escuchando en http://localhost:${port}`);
});
