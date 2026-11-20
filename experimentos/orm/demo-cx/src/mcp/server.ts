import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { Clientes } from '../clientes.js';
import type { Database } from '../db/connection.js';
import { errorPublico } from '../errores.js';
import * as s from './schemas.js';

export function crearServidorMcp(db: Database) {
  const server = new McpServer({ name: 'microcrm', version: '1.0.0' });

  function herramienta<S extends z.ZodRawShape>(nombre: string, descripcion: string, entrada: S,
    accion: (args: z.infer<z.ZodObject<S>>) => Promise<unknown>, lectura = false, destructiva = false) {
    const schema = z.object(entrada).strict();
    server.registerTool<z.ZodRawShape, typeof schema>(nombre, {
      description: descripcion,
      inputSchema: schema,
      annotations: { readOnlyHint: lectura, destructiveHint: destructiva, openWorldHint: false },
    }, async (args) => {
      try {
        const resultado = { datos: await accion(args as z.infer<z.ZodObject<S>>) };
        return { content: [{ type: 'text', text: JSON.stringify(resultado) }], structuredContent: resultado };
      } catch (error) {
        const resultado = errorPublico(error);
        if (resultado.codigo === 'interno') console.error(error);
        return { isError: true, content: [{ type: 'text', text: JSON.stringify(resultado) }], structuredContent: resultado };
      }
    });
  }

  herramienta('clientes_buscar', 'Busca clientes por cualquier campo e incluye su lista de actividades y estados.',
    { filtro: s.filtroCliente.optional() }, ({ filtro }) => Clientes.buscar(db, filtro), true);
  herramienta('clientes_obtener', 'Obtiene la ficha de un cliente con sus actividades y estados.',
    { clienteId: s.id }, ({ clienteId }) => Clientes.obtener(db, clienteId), true);
  herramienta('clientes_crear', 'Crea un cliente. Normaliza nombres, email y teléfono; el email debe ser único.',
    { datos: s.cliente }, ({ datos }) => Clientes.crear(db, datos));
  herramienta('clientes_actualizar', 'Actualiza los campos indicados del cliente; no reemplaza sus actividades.',
    { clienteId: s.id, datos: s.cambiosCliente }, ({ clienteId, datos }) => Clientes.actualizar(db, clienteId, datos));
  herramienta('clientes_eliminar', 'Elimina el cliente y todas sus actividades, incluidas las completadas. No se puede deshacer.',
    { clienteId: s.id }, ({ clienteId }) => Clientes.eliminar(db, clienteId), false, true);

  herramienta('actividades_buscar', 'Busca actividades exclusivamente dentro del cliente indicado, con su estado calculado.',
    { clienteId: s.id, filtro: s.filtroActividad.optional() }, ({ clienteId, filtro }) => Clientes.buscarActividades(db, clienteId, filtro), true);
  herramienta('actividades_obtener', 'Obtiene una actividad del cliente indicado. Rechaza IDs pertenecientes a otro cliente.',
    { clienteId: s.id, actividadId: s.id }, ({ clienteId, actividadId }) => Clientes.obtenerActividad(db, clienteId, actividadId), true);
  herramienta('actividades_crear', 'Agrega una actividad al cliente. Sin fechaFinalizacion queda pendiente; sin fechaCompromiso no tiene fecha prevista.',
    { clienteId: s.id, datos: s.actividad }, ({ clienteId, datos }) => Clientes.crearActividad(db, clienteId, datos));
  herramienta('actividades_actualizar', 'Modifica una actividad pendiente del cliente. Las completadas no se pueden editar ni reabrir.',
    { clienteId: s.id, actividadId: s.id, datos: s.cambiosActividad },
    ({ clienteId, actividadId, datos }) => Clientes.actualizarActividad(db, clienteId, actividadId, datos));
  herramienta('actividades_completar', 'Completa una actividad pendiente. Usa hoy en Tucumán si no se indica fecha. Después no admite edición ni borrado individual.',
    { clienteId: s.id, actividadId: s.id, fecha: s.fecha.optional() },
    ({ clienteId, actividadId, fecha }) => Clientes.completarActividad(db, clienteId, actividadId, fecha));
  herramienta('actividades_eliminar', 'Elimina una actividad pendiente dentro de su cliente. Las completadas no se pueden borrar individualmente.',
    { clienteId: s.id, actividadId: s.id }, ({ clienteId, actividadId }) => Clientes.eliminarActividad(db, clienteId, actividadId), false, true);

  return server;
}
