import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { Clientes } from './servicios/clientes.js';

export function crearServidorMcp() {
  const servidor = new McpServer({ name: 'minicrm', version: '1.0.0' });
  const responder = (fn: () => unknown) => {
    try {
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(fn()) }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: error instanceof Error ? error.message : 'Error inesperado.',
          },
        ],
      };
    }
  };
  servidor.registerTool(
    'clientes_listar',
    { description: 'Lista clientes.', inputSchema: {} },
    () => responder(() => Clientes.listar()),
  );
  servidor.registerTool(
    'clientes_buscar',
    {
      description: 'Busca clientes por email exacto o texto general.',
      inputSchema: { texto: z.string() },
    },
    ({ texto }) => responder(() => Clientes.buscarPorEmailOTexto(texto)),
  );
  servidor.registerTool(
    'clientes_crear',
    {
      description: 'Crea un cliente.',
      inputSchema: {
        nombre: z.string(),
        apellido: z.string(),
        email: z.string(),
        telefono: z.string().nullable().optional(),
      },
    },
    (datos) => responder(() => Clientes.crear(datos)),
  );
  servidor.registerTool(
    'clientes_actualizar',
    {
      description: 'Actualiza un cliente.',
      inputSchema: {
        id: z.number().int().positive(),
        nombre: z.string().optional(),
        apellido: z.string().optional(),
        email: z.string().optional(),
        telefono: z.string().nullable().optional(),
      },
    },
    ({ id, ...datos }) => responder(() => Clientes.actualizar(id, datos)),
  );
  servidor.registerTool(
    'clientes_eliminar',
    {
      description: 'Elimina un cliente y sus actividades.',
      inputSchema: { id: z.number().int().positive() },
    },
    ({ id }) => responder(() => Clientes.eliminar(id)),
  );
  servidor.registerTool(
    'actividades_listar',
    {
      description: 'Lista actividades de un cliente.',
      inputSchema: { clienteId: z.number().int().positive() },
    },
    ({ clienteId }) => responder(() => Clientes.listarActividades(clienteId)),
  );
  servidor.registerTool(
    'actividades_crear',
    {
      description: 'Crea una actividad pendiente.',
      inputSchema: {
        clienteId: z.number().int().positive(),
        descripcion: z.string(),
        fecha: z.string().nullable().optional(),
        fechaCompromiso: z.string().nullable().optional(),
      },
    },
    ({ clienteId, ...datos }) =>
      responder(() => Clientes.crearActividad(clienteId, datos)),
  );
  servidor.registerTool(
    'actividades_actualizar',
    {
      description: 'Actualiza una actividad pendiente del cliente.',
      inputSchema: {
        clienteId: z.number().int().positive(),
        id: z.number().int().positive(),
        descripcion: z.string().optional(),
        fecha: z.string().nullable().optional(),
        fechaCompromiso: z.string().nullable().optional(),
      },
    },
    ({ clienteId, id, ...datos }) =>
      responder(() => Clientes.actualizarActividad(clienteId, id, datos)),
  );
  servidor.registerTool(
    'actividades_eliminar',
    {
      description: 'Elimina una actividad pendiente del cliente.',
      inputSchema: {
        clienteId: z.number().int().positive(),
        id: z.number().int().positive(),
      },
    },
    ({ clienteId, id }) =>
      responder(() => Clientes.eliminarActividad(clienteId, id)),
  );
  servidor.registerTool(
    'actividades_completar',
    {
      description: 'Completa una actividad pendiente.',
      inputSchema: {
        clienteId: z.number().int().positive(),
        id: z.number().int().positive(),
      },
    },
    ({ clienteId, id }) =>
      responder(() => Clientes.completarActividad(clienteId, id)),
  );
  return servidor;
}

export function crearTransporteMcp() {
  return new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
}
