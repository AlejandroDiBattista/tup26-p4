import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { traer, listar } from '../alumnos.js';

const servidor = new FastMCP({ name: 'alumnos', version: '1.0.0' });

servidor.addTool({
  name: 'traer',
  description: 'Busca un alumno por su ID',
  parameters: z.object({ id: z.number().int() }),
  execute: async ({ id }) => JSON.stringify(traer(id))
});

servidor.addTool({
  name: 'listar',
  description: 'Busca el texto del filtro en cualquier campo del alumno, sin distinguir mayúsculas. Si no hay filtro, lista todos.',
  parameters: z.object({ filtro: z.string().optional() }),
  execute: async ({ filtro }) => JSON.stringify(listar(filtro))
});

// HTTP sin sesiones, con respuestas JSON para los clientes de esta clase.
const puerto = Number(process.env.PORT ?? 3000);
await servidor.start({
  transportType: 'httpStream',
  httpStream: { host: '127.0.0.1', port: puerto, stateless: true, enableJsonResponse: true }
});
