import express from 'express';
import path from 'node:path';

const app = express();

const carpetaPublica = path.join(import.meta.dirname, '..', 'public');

app.use(express.json());
app.use(express.static(carpetaPublica));
app.get('/', (req, res) => {
  res.redirect('/MiniCRM.html');
});
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, mensaje: 'El servidor responde' });
});

export { app };