import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Clientes } from './servicios.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// --- CONTROLADORES ---
const ClientesController = {
  obtenerTodos: (req: Request, res: Response) => {
    const q = req.query.q as string;
    res.json(Clientes.obtenerTodos(q));
  },
  obtenerPorId: (req: Request, res: Response) => {
    const cli = Clientes.obtenerPorId(Number(req.params.id));
    if (!cli) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cli);
  },
  crear: (req: Request, res: Response) => {
    try {
      Clientes.crearCliente(req.body);
      res.status(201).json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  },
  actualizar: (req: Request, res: Response) => {
    Clientes.actualizarCliente(Number(req.params.id), req.body);
    res.json({ success: true });
  },
  eliminar: (req: Request, res: Response) => {
    Clientes.eliminarCliente(Number(req.params.id));
    res.json({ success: true });
  },
  agregarActividad: (req: Request, res: Response) => {
    Clientes.agregarActividad(Number(req.params.id), req.body);
    res.status(201).json({ success: true });
  },
  actualizarActividad: (req: Request, res: Response) => {
    Clientes.actualizarActividad(Number(req.params.id), req.body);
    res.json({ success: true });
  },
  eliminarActividad: (req: Request, res: Response) => {
    Clientes.eliminarActividad(Number(req.params.id));
    res.json({ success: true });
  }
};

// --- ROUTERS ---
const apiRouter = Router();

apiRouter.get('/clientes', ClientesController.obtenerTodos);
apiRouter.get('/clientes/:id', ClientesController.obtenerPorId);
apiRouter.post('/clientes', ClientesController.crear);
apiRouter.put('/clientes/:id', ClientesController.actualizar);
apiRouter.delete('/clientes/:id', ClientesController.eliminar);

apiRouter.post('/clientes/:id/actividades', ClientesController.agregarActividad);
apiRouter.put('/actividades/:id', ClientesController.actualizarActividad);
apiRouter.delete('/actividades/:id', ClientesController.eliminarActividad);

app.use('/api', apiRouter);

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});