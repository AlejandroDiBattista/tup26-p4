import express from 'express';
import { rutasApi } from './rutas/api.js';
import { crearServidorMcp, crearTransporteMcp } from './mcp.js';

const app = express();
app.use(express.json());
app.use('/api', rutasApi);
app.use(express.static('web'));
app.get('/', (_req, res) => res.redirect('/clientes.html'));
app.post('/mcp', async (req, res, next) => {
  try {
    const servidor = crearServidorMcp();
    const transporte = crearTransporteMcp();
    await servidor.connect(transporte);
    await transporte.handleRequest(req, res, req.body);
  } catch (error) {
    next(error);
  }
});
app.get('/mcp', (_req, res) =>
  res
    .status(405)
    .set('Allow', 'POST')
    .json({ error: 'Usa POST con el protocolo MCP Streamable HTTP.' }),
);
app.delete('/mcp', (_req, res) =>
  res
    .status(405)
    .set('Allow', 'POST')
    .json({ error: 'Las sesiones MCP no están habilitadas.' }),
);
app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    const mensaje = error instanceof Error ? error.message : 'Error interno.';
    const estado = /no existe|no encontrado/i.test(mensaje)
      ? 404
      : /único|unique|válido|obligatorio|positivo/i.test(mensaje)
        ? 400
        : 500;
    res.status(estado).json({ error: mensaje });
  },
);
const puerto = Number(process.env.PORT || 3000);
app.listen(puerto, () =>
  console.log(`MiniCRM disponible en http://localhost:${puerto}`),
);
