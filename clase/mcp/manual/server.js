import express from 'express';
import { traer, listar } from '../alumnos.js';

const app = express();
app.use(express.json());

// Cada POST recibe un mensaje MCP en formato JSON-RPC.
/// JSON-RPC: https://www.jsonrpc.org/specification
app.post('/mcp', (req, res) => {
  const { id, method, params = {} } = req.body;
  let result;

  // Las notificaciones no tienen id ni respuesta JSON.
  if (id === undefined) return res.status(202).end();

  switch (method) {
    case 'initialize':
      result = {
        protocolVersion: '2025-11-25',
        capabilities: { tools: {} },
        serverInfo:   { name: 'alumnos', version: '1.0.0' }
      };
      break;

    case 'ping':
      result = {};
      break;

    // El cliente descubre qué funciones hay y qué argumentos reciben.
    case 'tools/list':
      result = {
        tools: [
          {
            name: 'traer',
            description: 'Busca un alumno por su ID',
            inputSchema: {
              type: 'object',
              properties: { id: { type: 'integer' } },
              required: ['id']
            }
          },
          {
            name: 'listar',
            description: 'Busca el texto del filtro en cualquier campo del alumno, sin distinguir mayúsculas. Si no hay filtro, lista todos.',
            inputSchema: {
              type: 'object',
              properties: { filtro: { type: 'string' } }
            }
          }
        ]
      };
      break;

    // El cliente elige una función y envía sus argumentos.
    case 'tools/call': {
      const { name, arguments: argumentos = {} } = params;
      let datos;
      if (name === 'traer')  datos = traer(argumentos.id);
      if (name === 'listar') datos = listar(argumentos.filtro);
      result = { content: [{ type: 'text', text: JSON.stringify(datos) }] };
      break;
    }

    default:
      return res.json({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Método desconocido' } });
  }

  res.json({ jsonrpc: '2.0', id, result });
});

// GET 405 indica al cliente que no hay flujo de eventos SSE.
app.get('/mcp', (req, res) => res.sendStatus(405));

const puerto = Number(process.env.PORT ?? 3000);
const servidor = app.listen(puerto, '127.0.0.1', error => {
  if (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exitCode = 1;
    return;
  }
  console.log(`MCP disponible en http://127.0.0.1:${servidor.address().port}/mcp`);
});
