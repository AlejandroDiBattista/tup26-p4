import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Router } from 'express';
import { z } from 'zod/v3';
import { Clientes } from './repositorios/clientes.js';

function crearServidorMcp() {
  const servidor = new McpServer({ name: 'mini-crm', version: '1.0.0' });
  const id = z.number().int().positive();
  const cliente = {
    nombre: z.string().trim().min(1), apellido: z.string().trim().min(1),
    email: z.string().trim().min(1), telefono: z.string().nullable().optional(),
  };
  const actividad = {
    descripcion: z.string().trim().min(1),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
    fechaCompromiso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  };

  function registrar<T extends z.ZodRawShape>(nombre: string, descripcion: string, esquema: T,
    ejecutar: (datos: z.infer<z.ZodObject<T>>) => Promise<unknown>) {
    servidor.registerTool(nombre, { description: descripcion, inputSchema: esquema as z.ZodRawShape }, async datos => {
      try {
        const resultado = await ejecutar(z.object(esquema).parse(datos));
        if (resultado === undefined || resultado === false) throw new Error('Registro inexistente o actividad completada que no permite cambios.');
        return { content: [{ type: 'text' as const, text: JSON.stringify(resultado) }] };
      } catch (error) {
        return { isError: true, content: [{ type: 'text' as const, text: error instanceof Error ? error.message : 'Error interno.' }] };
      }
    });
  }

  registrar('listar_clientes', 'Lista todos los clientes.', {}, () => Clientes.listar());
  registrar('buscar_clientes', 'Busca texto en los campos del cliente.', { texto: z.string() }, datos => Clientes.buscar(datos.texto));
  registrar('obtener_cliente', 'Obtiene un cliente.', { id }, datos => Clientes.obtener(datos.id));
  registrar('buscar_cliente_por_email', 'Obtiene un cliente por email.', { email: z.string() }, datos => Clientes.buscarPorEmail(datos.email));
  registrar('crear_cliente', 'Crea un cliente.', cliente, datos => Clientes.crear(datos));
  registrar('actualizar_cliente', 'Actualiza un cliente.', { id, datos: z.object(cliente).partial() }, datos => Clientes.actualizar(datos.id, datos.datos));
  registrar('eliminar_cliente', 'Elimina un cliente y sus actividades en cascada.', { id }, datos => Clientes.eliminar(datos.id));

  async function exigirCliente(clienteId: number) {
    if (!await Clientes.obtener(clienteId)) throw new Error('Cliente no encontrado.');
  }
  registrar('listar_actividades', 'Lista las actividades del cliente.', { clienteId: id }, async datos => { await exigirCliente(datos.clienteId); return Clientes.listarActividades(datos.clienteId); });
  registrar('listar_actividades_pendientes', 'Lista compromisos pendientes.', { clienteId: id }, async datos => { await exigirCliente(datos.clienteId); return Clientes.listarActividadesPendientes(datos.clienteId); });
  registrar('listar_actividades_vencidas', 'Lista compromisos vencidos.', { clienteId: id }, async datos => { await exigirCliente(datos.clienteId); return Clientes.listarActividadesVencidas(datos.clienteId); });
  registrar('listar_actividades_sin_compromiso', 'Lista pendientes sin fecha.', { clienteId: id }, async datos => { await exigirCliente(datos.clienteId); return Clientes.listarActividadesSinCompromiso(datos.clienteId); });
  registrar('obtener_actividad', 'Obtiene una actividad del cliente.', { clienteId: id, actividadId: id }, datos => Clientes.obtenerActividad(datos.clienteId, datos.actividadId));
  registrar('crear_actividad', 'Agrega un compromiso al cliente.', { clienteId: id, datos: z.object(actividad) }, async datos => {
    await exigirCliente(datos.clienteId);
    return Clientes.crearActividad(datos.clienteId, datos.datos);
  });
  registrar('actualizar_actividad', 'Edita una actividad pendiente del cliente.', { clienteId: id, actividadId: id, datos: z.object(actividad).partial() }, datos => Clientes.actualizarActividad(datos.clienteId, datos.actividadId, datos.datos));
  registrar('completar_actividad', 'Completa una actividad pendiente del cliente.', { clienteId: id, actividadId: id }, datos => Clientes.completarActividad(datos.clienteId, datos.actividadId));
  registrar('eliminar_actividad', 'Elimina una actividad pendiente del cliente.', { clienteId: id, actividadId: id }, datos => Clientes.eliminarActividad(datos.clienteId, datos.actividadId));
  return servidor;
}

export const mcpRouter = Router();
mcpRouter.post('/', async (req, res, next) => {
  const servidor = crearServidorMcp();
  const transporte = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on('close', () => { void transporte.close(); void servidor.close(); });
  try {
    await servidor.connect(transporte);
    await transporte.handleRequest(req, res, req.body);
  } catch (error) { next(error); }
});
mcpRouter.all('/', (_req, res) => {
  res.status(405).set('Allow', 'POST').json({ jsonrpc: '2.0', id: null, error: { code: -32000, message: 'Este transporte MCP sin sesión utiliza POST.' } });
});
