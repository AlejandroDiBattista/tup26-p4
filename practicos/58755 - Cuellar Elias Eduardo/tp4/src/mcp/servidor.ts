import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { Clientes } from "../servicios/clientes.js";
import { ErrorDominio } from "../servicios/errores.js";

// Las herramientas solo adaptan argumentos y resultados: toda validación, normalización y regla
// de negocio la aplica la clase Clientes, igual que en la API REST y sobre la misma base.

// ── Resultados ────────────────────────────────────────────────────────────────

/**
 * Éxito: el resultado va como JSON en texto (para modelos) y en structuredContent (para programas).
 * structuredContent debe ser un objeto, por eso las listas y los "sin resultado" se envuelven.
 */
function exito(datos: Record<string, unknown>): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(datos, null, 2) }],
    structuredContent: datos,
  };
}

/** Los errores de negocio se devuelven como resultado con isError (el modelo puede leerlos y corregir). */
function fallo(error: ErrorDominio): CallToolResult {
  const detalle = { codigo: error.codigo, mensaje: error.message, ...(error.campo ? { campo: error.campo } : {}) };
  return {
    content: [{ type: "text", text: `${error.codigo}: ${error.message}` }],
    structuredContent: { error: detalle },
    isError: true,
  };
}

async function ejecutar(accion: () => Promise<Record<string, unknown>>): Promise<CallToolResult> {
  try {
    return exito(await accion());
  } catch (error) {
    if (error instanceof ErrorDominio) return fallo(error);
    throw error; // error inesperado: el SDK lo informa como error de la herramienta
  }
}

// ── Esquemas de entrada ───────────────────────────────────────────────────────

const idCliente = z.number().int().positive().describe("Id numérico del cliente");
const idActividad = z.number().int().positive().describe("Id numérico de la actividad");
const fecha = (descripcion: string) => z.string().describe(`${descripcion} (AAAA-MM-DD)`);
const textoOpcional = (descripcion: string) =>
  z.string().nullable().optional().describe(`${descripcion}. null o vacío lo deja sin dato`);

const camposCliente = {
  nombre: z.string().describe("Nombre (se normaliza: mayúscula inicial)"),
  apellido: z.string().describe("Apellido (se normaliza: mayúscula inicial)"),
  email: z.string().describe("Email único (se guarda en minúsculas)"),
  telefono: textoOpcional("Teléfono (se normaliza a dígitos separados por guiones)"),
  domicilio: textoOpcional("Domicilio"),
  localidad: textoOpcional("Localidad"),
};

const LECTURA = { readOnlyHint: true, openWorldHint: false } as const;
const ESCRITURA = { readOnlyHint: false, destructiveHint: false, openWorldHint: false } as const;
const BORRADO = { readOnlyHint: false, destructiveHint: true, openWorldHint: false } as const;

// ── Servidor ──────────────────────────────────────────────────────────────────

export function crearServidorMcp(): McpServer {
  const servidor = new McpServer(
    { name: "minicrm", title: "MiniCRM", version: "1.0.0" },
    {
      instructions:
        "Gestiona clientes y sus actividades. Una actividad está completada si tiene fechaFinalizacion; " +
        "vencida si no está completada y su fechaCompromiso es anterior a hoy. Las actividades completadas " +
        "no se pueden editar, volver a completar ni eliminar individualmente.",
    },
  );

  // ── Clientes ──

  servidor.registerTool("listar_clientes", {
    title: "Listar clientes",
    description:
      "Lista los clientes ordenados por apellido y nombre. `busqueda` es opcional: cada palabra debe aparecer " +
      "en algún campo (sin distinguir mayúsculas ni acentos) y `campo:valor` restringe a un campo, " +
      "por ejemplo \"localidad:salta\".",
    inputSchema: { busqueda: z.string().optional().describe("Texto a buscar en cualquier campo") },
    annotations: LECTURA,
  }, ({ busqueda }) => ejecutar(async () => ({ clientes: await Clientes.listar(busqueda) })));

  servidor.registerTool("obtener_cliente", {
    title: "Obtener cliente",
    description: "Devuelve la ficha de un cliente con sus actividades (cada una con su estado).",
    inputSchema: { clienteId: idCliente },
    annotations: LECTURA,
  }, ({ clienteId }) => ejecutar(async () => ({ cliente: await Clientes.obtener(clienteId) })));

  servidor.registerTool("crear_cliente", {
    title: "Crear cliente",
    description: "Da de alta un cliente. El email no puede repetirse.",
    inputSchema: camposCliente,
    annotations: ESCRITURA,
  }, (datos) => ejecutar(async () => ({ cliente: await Clientes.crear(datos) })));

  servidor.registerTool("actualizar_cliente", {
    title: "Actualizar cliente",
    description: "Modifica solo los campos enviados de un cliente.",
    inputSchema: {
      clienteId: idCliente,
      nombre: camposCliente.nombre.optional(),
      apellido: camposCliente.apellido.optional(),
      email: camposCliente.email.optional(),
      telefono: camposCliente.telefono,
      domicilio: camposCliente.domicilio,
      localidad: camposCliente.localidad,
    },
    annotations: { ...ESCRITURA, idempotentHint: true },
  }, ({ clienteId, ...cambios }) => ejecutar(async () => ({ cliente: await Clientes.actualizar(clienteId, cambios) })));

  servidor.registerTool("eliminar_cliente", {
    title: "Eliminar cliente",
    description: "Elimina un cliente y todas sus actividades, incluidas las completadas. No se puede deshacer.",
    inputSchema: { clienteId: idCliente },
    annotations: BORRADO,
  }, ({ clienteId }) => ejecutar(async () => {
    await Clientes.eliminar(clienteId);
    return { eliminado: true, clienteId };
  }));

  // ── Actividades ──

  servidor.registerTool("listar_actividades", {
    title: "Listar actividades",
    description: "Lista las actividades de un cliente con su estado (pendiente, vencida o completada).",
    inputSchema: { clienteId: idCliente },
    annotations: LECTURA,
  }, ({ clienteId }) => ejecutar(async () => ({ actividades: await Clientes.listarActividades(clienteId) })));

  servidor.registerTool("agregar_actividad", {
    title: "Agregar actividad",
    description: "Agrega una actividad a un cliente. La descripción no puede repetirse dentro del mismo cliente.",
    inputSchema: {
      clienteId: idCliente,
      descripcion: z.string().describe("Descripción de la actividad"),
      fechaCompromiso: fecha("Fecha comprometida").nullable().optional(),
    },
    annotations: ESCRITURA,
  }, ({ clienteId, ...datos }) => ejecutar(async () => ({
    actividad: await Clientes.agregarActividad(clienteId, datos),
  })));

  servidor.registerTool("actualizar_actividad", {
    title: "Actualizar actividad",
    description: "Edita la descripción y/o la fecha de compromiso de una actividad pendiente. Las completadas no se pueden editar.",
    inputSchema: {
      clienteId: idCliente,
      actividadId: idActividad,
      descripcion: z.string().optional().describe("Nueva descripción"),
      fechaCompromiso: fecha("Nueva fecha comprometida; null la deja sin fecha").nullable().optional(),
    },
    annotations: { ...ESCRITURA, idempotentHint: true },
  }, ({ clienteId, actividadId, ...cambios }) => ejecutar(async () => ({
    actividad: await Clientes.actualizarActividad(clienteId, actividadId, cambios),
  })));

  servidor.registerTool("completar_actividad", {
    title: "Completar actividad",
    description: "Marca una actividad pendiente como completada (hoy, o en la fecha indicada si no es futura). Es irreversible.",
    inputSchema: {
      clienteId: idCliente,
      actividadId: idActividad,
      fechaFinalizacion: fecha("Fecha de finalización; por defecto, hoy").optional(),
    },
    annotations: ESCRITURA,
  }, ({ clienteId, actividadId, fechaFinalizacion }) => ejecutar(async () => ({
    actividad: await Clientes.completarActividad(clienteId, actividadId, fechaFinalizacion),
  })));

  servidor.registerTool("eliminar_actividad", {
    title: "Eliminar actividad",
    description: "Elimina una actividad pendiente. Las completadas no se pueden eliminar individualmente.",
    inputSchema: { clienteId: idCliente, actividadId: idActividad },
    annotations: BORRADO,
  }, ({ clienteId, actividadId }) => ejecutar(async () => {
    await Clientes.eliminarActividad(clienteId, actividadId);
    return { eliminada: true, actividadId };
  }));

  return servidor;
}
