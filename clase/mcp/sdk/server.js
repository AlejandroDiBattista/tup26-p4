import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { z } from 'zod';
import { traer, listar } from '../alumnos.js';

// El SDK se encarga de los mensajes y del protocolo MCP.
function crearServidor() {
  const servidor = new McpServer({ name: 'alumnos', version: '1.0.0' });

  servidor.registerTool('traer', {
    description: 'Busca un alumno por su ID',
    inputSchema: { id: z.number().int() }
  }, async ({ id }) => ({ content: [{ type: 'text', text: JSON.stringify(traer(id)) }] }));

  servidor.registerTool('listar', {
    description: 'Busca el texto del filtro en cualquier campo del alumno, sin distinguir mayúsculas. Si no hay filtro, lista todos.',
    inputSchema: { filtro: z.string().optional() }
  }, async ({ filtro }) => ({ content: [{ type: 'text', text: JSON.stringify(listar(filtro)) }] }));

  return servidor;
}

const app = createMcpExpressApp();

app.post('/mcp', async (req, res) => {
  // Sin sesiones: cada solicitud tiene su propio servidor y transporte.
  const servidor = crearServidor();
  const transporte = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });
  res.on('close', () => {
    transporte.close();
    servidor.close();
  });
  await servidor.connect(transporte);
  await transporte.handleRequest(req, res, req.body);
});

app.get('/mcp', (req, res) => res.sendStatus(405));
app.delete('/mcp', (req, res) => res.sendStatus(405));

const puerto = Number(process.env.PORT ?? 3000);
app.listen(puerto, '127.0.0.1', () => {
  console.log(`MCP con SDK disponible en http://127.0.0.1:${puerto}/mcp`);
});
