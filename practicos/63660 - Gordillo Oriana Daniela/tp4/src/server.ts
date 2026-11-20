import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import clientesRouter from './routes/clientes.routes.js';
import { initDb } from './db/connection.js';
import { seed } from './db/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
const publicDir = path.resolve(__dirname, '../public');
app.use(express.static(publicDir));

// Redirección de la raíz al archivo principal
app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'MiniCRM.html'));
});

// Alias insensible a mayúsculas
app.get('/minicrm', (_req, res) => {
  res.sendFile(path.join(publicDir, 'MiniCRM.html'));
});

// Rutas de la API REST
app.use('/api', clientesRouter);

// Manejo de errores 404 para API
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint de API no encontrado' });
});

export async function bootstrap() {
  try {
    await initDb();
    await seed();
    const server = app.listen(PORT, () => {
      console.log(`🚀 MiniCRM escuchando en http://localhost:${PORT}`);
      console.log(`🌐 Interfaz web disponible en: http://localhost:${PORT}/MiniCRM.html`);
    });
    return server;
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor si es ejecutado directamente
if (process.argv[1]?.endsWith('server.ts') || process.argv[1]?.endsWith('server.js')) {
  bootstrap();
}
