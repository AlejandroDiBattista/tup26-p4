import type { Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { Clientes } from './clientes.js';
import { describirError } from './errores.js';
import { cambiosActividad, cambiosCliente, datosActividad, datosCliente, filtroActividad, idValido } from './validacion.js';

function crearServidorMcp() {
  const servidor = new McpServer({ name: 'minicrm', version: '1.0.0' });
  function herramienta<T extends z.ZodRawShape>(nombre: string, descripcion: string, esquema: T, ejecutar: (datos: z.infer<z.ZodObject<T>>) => Promise<unknown>) {
    const entrada: z.AnyZodObject = z.object(esquema).strict();
    servidor.registerTool(nombre, { description: descripcion, inputSchema: entrada }, async datos => {
      try {
        const resultado = await ejecutar(datos as z.infer<z.ZodObject<T>>);
        return { content: [{ type: 'text' as const, text: JSON.stringify(resultado) }] };
      } catch (error) {
        return { isError: true, content: [{ type: 'text' as const, text: JSON.stringify(describirError(error)) }] };
      }
    });
  }
  const cliente = { clienteId: idValido };
  const actividad = { ...cliente, actividadId: idValido };
  herramienta('clientes_buscar', 'Lista clientes o busca texto en cualquiera de sus campos.', { texto: z.string().default('') }, d => Clientes.buscar(d.texto));
  herramienta('clientes_buscar_email', 'Busca un cliente por email exacto normalizado.', { email: z.string() }, d => Clientes.buscarPorEmail(d.email));
  herramienta('clientes_obtener', 'Obtiene la ficha de un cliente.', cliente, d => Clientes.obtener(d.clienteId));
  herramienta('clientes_crear', 'Crea un cliente y normaliza sus datos.', { datos: datosCliente }, d => Clientes.crear(d.datos));
  herramienta('clientes_actualizar', 'Actualiza los campos indicados de un cliente.', { ...cliente, datos: cambiosCliente }, d => Clientes.actualizar(d.clienteId, d.datos));
  herramienta('clientes_eliminar', 'Elimina un cliente junto con todas sus actividades.', cliente, d => Clientes.eliminar(d.clienteId));
  herramienta('actividades_listar', 'Lista todas, pendientes, vencidas en Tucumán o sin compromiso de un cliente.', { ...cliente, filtro: filtroActividad.default('todas') }, d => Clientes.listarActividades(d.clienteId, d.filtro));
  herramienta('actividades_obtener', 'Obtiene una actividad dentro de su cliente.', actividad, d => Clientes.obtenerActividad(d.clienteId, d.actividadId));
  herramienta('actividades_crear', 'Crea una actividad pendiente dentro de un cliente.', { ...cliente, datos: datosActividad }, d => Clientes.crearActividad(d.clienteId, d.datos));
  herramienta('actividades_actualizar', 'Edita una actividad pendiente; las completadas son inalterables.', { ...actividad, datos: cambiosActividad }, d => Clientes.actualizarActividad(d.clienteId, d.actividadId, d.datos));
  herramienta('actividades_eliminar', 'Elimina una actividad pendiente dentro de su cliente.', actividad, d => Clientes.eliminarActividad(d.clienteId, d.actividadId));
  herramienta('actividades_completar', 'Completa una actividad con fecha y hora del servidor. Repetir conserva la finalización.', actividad, d => Clientes.completarActividad(d.clienteId, d.actividadId));
  return servidor;
}

export async function atenderMcp(req: Request, res: Response) {
  // Cada petición tiene su transporte: sin sesiones persistentes ni estado global.
  const servidor = crearServidorMcp();
  const transporte = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on('close', () => { void servidor.close(); });
  await servidor.connect(transporte);
  await transporte.handleRequest(req, res, req.body);
}
