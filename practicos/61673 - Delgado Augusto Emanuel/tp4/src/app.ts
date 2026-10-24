import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import apiRouter from './routes';

export const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta public
const publicDir = path.resolve(process.cwd(), 'public');
app.use(express.static(publicDir));

// Redireccionar raíz a la interfaz del CRM
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'MiniCRM.html'));
});

// Rutas API REST
app.use('/api', apiRouter);

// Manejador global de errores
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});
