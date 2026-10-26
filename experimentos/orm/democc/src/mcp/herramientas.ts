import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { Clientes, filtrosActividades } from '../servicios/clientes';
import { ErrorDeNegocio } from '../servicios/errores';

// ── Esquemas de entrada reutilizables ─────────────────────────

const clienteId = z.number().int().positive().describe('Id del cliente');
const actividadId = z.number().int().positive().describe('Id de la actividad');
const fecha = (descripcion: string) =>
  z.string().nullable().optional().describe(`${descripcion}, con formato AAAA-MM-DD (null para quitarla)`);

const datosCliente = {
  nombre: z.string().describe('Nombre; se guarda con mayúscula inicial'),
  apellido: z.string().describe('Apellido; se guarda con mayúscula inicial'),
  email: z.string().describe('Email único; se guarda en minúsculas'),
  telefono: z.string().nullable().optional()
    .describe('Teléfono argentino con código de área; se guarda en formato E.164 (null para quitarlo)'),
};

const datosActividad = {
  descripcion: z.string().describe('Qué hay que hacer o qué se hizo'),
  fecha: fecha('Fecha de la actividad'),
  compromiso: fecha('Fecha comprometida para completarla'),
};

// ── Respuestas ────────────────────────────────────────────────

/** Ejecuta la acción y devuelve su resultado como JSON, o el error de negocio como texto. */
async function responder(accion: () => Promise<unknown>): Promise<CallToolResult> {
  try {
    const resultado = await accion();
    return { content: [{ type: 'text', text: JSON.stringify(resultado) }] };
  } catch (error) {
    if (error instanceof ErrorDeNegocio) {
      return { isError: true, content: [{ type: 'text', text: error.message }] };
    }
    console.error(error);
    return { isError: true, content: [{ type: 'text', text: 'Error interno del servidor.' }] };
  }
}

// ── Servidor ──────────────────────────────────────────────────

/** Crea un servidor MCP que expone el servicio de clientes como herramientas. */
export function crearServidorMcp() {
  const servidor = new McpServer({ name: 'minicrm', version: '1.0.0' });

  // Clientes

  servidor.registerTool('listar_clientes', {
    description: 'Lista todos los clientes, ordenados por apellido y nombre.',
  }, () => responder(() => Clientes.listar()));

  servidor.registerTool('buscar_clientes', {
    description: 'Busca clientes cuyo nombre, apellido, email o teléfono contiene el texto.',
    inputSchema: { texto: z.string().describe('Texto a buscar') },
  }, ({ texto }) => responder(() => Clientes.buscar(texto)));

  servidor.registerTool('buscar_cliente_por_email', {
    description: 'Devuelve el cliente con ese email, o null si no existe.',
    inputSchema: { email: z.string().describe('Email del cliente') },
  }, ({ email }) => responder(async () => (await Clientes.buscarPorEmail(email)) ?? null));

  servidor.registerTool('obtener_cliente', {
    description: 'Devuelve los datos de un cliente.',
    inputSchema: { clienteId },
  }, ({ clienteId }) => responder(() => Clientes.obtener(clienteId)));

  servidor.registerTool('crear_cliente', {
    description: 'Da de alta un cliente. Normaliza nombre, apellido, email y teléfono.',
    inputSchema: datosCliente,
  }, (datos) => responder(() => Clientes.crear(datos)));

  servidor.registerTool('actualizar_cliente', {
    description: 'Modifica los datos indicados de un cliente; los demás quedan igual.',
    inputSchema: {
      clienteId,
      nombre: datosCliente.nombre.optional(),
      apellido: datosCliente.apellido.optional(),
      email: datosCliente.email.optional(),
      telefono: datosCliente.telefono,
    },
  }, ({ clienteId, ...datos }) => responder(() => Clientes.actualizar(clienteId, datos)));

  servidor.registerTool('eliminar_cliente', {
    description: 'Elimina un cliente junto con todas sus actividades.',
    inputSchema: { clienteId },
  }, ({ clienteId }) => responder(async () => {
    await Clientes.eliminar(clienteId);
    return { mensaje: `Cliente #${clienteId} eliminado junto con sus actividades.` };
  }));

  // Actividades (siempre dentro de un cliente)

  servidor.registerTool('listar_actividades', {
    description:
      'Lista las actividades de un cliente. Pendiente: sin finalización. Vencida: pendiente con compromiso ' +
      'anterior a hoy en Tucumán. Sin compromiso: pendiente sin fecha de compromiso.',
    inputSchema: {
      clienteId,
      estado: z.enum(filtrosActividades).default('todas').describe('Qué actividades listar'),
    },
  }, ({ clienteId, estado }) => responder(() => Clientes.listarActividades(clienteId, estado)));

  servidor.registerTool('obtener_actividad', {
    description: 'Devuelve una actividad de un cliente.',
    inputSchema: { clienteId, actividadId },
  }, ({ clienteId, actividadId }) => responder(() => Clientes.obtenerActividad(clienteId, actividadId)));

  servidor.registerTool('agregar_actividad', {
    description: 'Agrega una actividad pendiente a un cliente.',
    inputSchema: { clienteId, ...datosActividad },
  }, ({ clienteId, ...datos }) => responder(() => Clientes.agregarActividad(clienteId, datos)));

  servidor.registerTool('actualizar_actividad', {
    description: 'Modifica los datos indicados de una actividad pendiente. Las completadas no se pueden editar.',
    inputSchema: {
      clienteId,
      actividadId,
      descripcion: datosActividad.descripcion.optional(),
      fecha: datosActividad.fecha,
      compromiso: datosActividad.compromiso,
    },
  }, ({ clienteId, actividadId, ...datos }) =>
    responder(() => Clientes.actualizarActividad(clienteId, actividadId, datos)));

  servidor.registerTool('eliminar_actividad', {
    description: 'Borra una actividad pendiente. Las completadas no se pueden borrar.',
    inputSchema: { clienteId, actividadId },
  }, ({ clienteId, actividadId }) => responder(async () => {
    await Clientes.eliminarActividad(clienteId, actividadId);
    return { mensaje: `Actividad #${actividadId} eliminada.` };
  }));

  servidor.registerTool('completar_actividad', {
    description: 'Marca una actividad pendiente como completada con la fecha y hora actuales.',
    inputSchema: { clienteId, actividadId },
  }, ({ clienteId, actividadId }) => responder(() => Clientes.completarActividad(clienteId, actividadId)));

  return servidor;
}
