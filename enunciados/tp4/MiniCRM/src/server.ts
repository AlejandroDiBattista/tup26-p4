import express, { type ErrorRequestHandler } from 'express';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './db/index.js';
import { router } from './routes/api.js';
import { ErrorHttp } from './controllers/validacion.js';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const migrationsFolder = fileURLToPath(new URL('../drizzle/', import.meta.url));
const app = express();

app.use('/api', express.json(), router, (_req, res) => {
    res.status(404).json({ error: 'Ruta inexistente.' });
});
app.use(express.static(publicDir, { index: 'MiniCRM.html' }));

const manejarError: ErrorRequestHandler = (error, _req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof ErrorHttp) {
        res.status(error.status).json({ error: error.message });
    } else if (error.type === 'entity.parse.failed') {
        res.status(400).json({ error: 'JSON inválido.' });
    } else if (error.type === 'entity.too.large') {
        res.status(413).json({ error: 'El cuerpo de la solicitud es demasiado grande.' });
    } else {
        console.error(error);
        res.status(500).json({ error: 'Ocurrió un error en el servidor.' });
    }
};
app.use(manejarError);

await migrate(db, { migrationsFolder });
await db.run('PRAGMA foreign_keys = ON');

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log('MiniCRM en http://localhost:' + port));
