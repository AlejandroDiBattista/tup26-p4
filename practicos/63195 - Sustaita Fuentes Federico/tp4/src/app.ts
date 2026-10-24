import express from 'express';
import rutas from './routes';
import { manejarErrores, rutaNoEncontrada } from './middlewares/errores';

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => res.redirect('/MiniCRM.html'));
app.use('/api', rutas);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

export default app;
