import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { Clientes } from "../services/clientes.service";
import { ErrorNoEncontrado, ErrorReglaNegocio, ErrorValidacion } from "../services/errores";

// ───────────── Esquemas de entrada (el SDK los publica como JSON Schema) ─────────────
const id = (que: string) => z.number().int().positive().describe(`ID ${que}`);
const fecha = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato esperado YYYY-MM-DD")
  .describe("Fecha en formato YYYY-MM-DD");
const opcional = (desc: string) => z.string().nullable().optional().describe(`${desc} (opcional; null o "" lo borra)`);

const camposCliente = {
  nombre: z.string().min(1).describe("Nombre (se normaliza: 'juan' -> 'Juan')"),
  apellido: z.string().min(1).describe("Apellido"),
  email: z.string().email().describe("Email único (se guarda en minúsculas)"),
  domicilio: opcional("Domicilio"),
  localidad: opcional("Localidad"),
  telefono: opcional("Teléfono (se guardan solo los dígitos y un '+' inicial)"),
};

// ───────────── Resultados ─────────────
const ok = (datos: unknown): CallToolResult => ({
  content: [{ type: "text", text: JSON.stringify(datos ?? { ok: true }) }],
});

/**
 * Errores de negocio -> resultado con isError (el modelo/cliente puede leerlo y corregir).
 * Errores inesperados se relanzan y el SDK responde un error de protocolo JSON-RPC.
 */
async function ejecutar(accion: () => Promise<unknown>): Promise<CallToolResult> {
  try {
    return ok(await accion());
  } catch (e) {
    if (e instanceof ErrorValidacion || e instanceof ErrorNoEncontrado || e instanceof ErrorReglaNegocio) {
      return {
        isError: true,
        content: [{ type: "text", text: JSON.stringify({ error: { status: e.status, tipo: e.name, mensaje: e.message } }) }],
      };
    }
    throw e;
  }
}

/** Crea un servidor MCP con las operaciones del servicio Clientes como tools. */
export function crearServidorMcp(): McpServer {
  const server = new McpServer({ name: "minicrm", version: "1.0.0" });

  // ── Clientes ──
  server.registerTool(
    "buscar_clientes",
    {
      title: "Buscar clientes",
      description:
        "Lista clientes ordenados por apellido. 'q' busca en todos los campos (cada palabra debe aparecer en algún campo, " +
        "sin distinguir acentos ni mayúsculas). Los demás parámetros filtran por campo. Sin parámetros devuelve todos.",
      inputSchema: {
        q: z.string().optional().describe("Texto libre a buscar en cualquier campo"),
        nombre: z.string().optional(),
        apellido: z.string().optional(),
        email: z.string().optional(),
        domicilio: z.string().optional(),
        localidad: z.string().optional(),
        telefono: z.string().optional(),
      },
      annotations: { readOnlyHint: true },
    },
    ({ q, ...filtro }) => ejecutar(() => Clientes.buscar(q ?? filtro)),
  );

  server.registerTool(
    "obtener_cliente",
    {
      title: "Obtener cliente",
      description: "Devuelve la ficha de un cliente con sus actividades (cada una con 'completada' y 'vencida').",
      inputSchema: { id: id("del cliente") },
      annotations: { readOnlyHint: true },
    },
    ({ id }) => ejecutar(() => Clientes.obtener(id)),
  );

  server.registerTool(
    "crear_cliente",
    { title: "Crear cliente", description: "Da de alta un cliente. Los datos se normalizan al guardar.", inputSchema: camposCliente },
    (datos) => ejecutar(() => Clientes.crear(datos)),
  );

  server.registerTool(
    "actualizar_cliente",
    {
      title: "Actualizar cliente",
      description: "Modifica los campos indicados de un cliente; los omitidos no cambian.",
      inputSchema: {
        id: id("del cliente"),
        nombre: camposCliente.nombre.optional(),
        apellido: camposCliente.apellido.optional(),
        email: camposCliente.email.optional(),
        domicilio: camposCliente.domicilio,
        localidad: camposCliente.localidad,
        telefono: camposCliente.telefono,
      },
      annotations: { idempotentHint: true },
    },
    ({ id, ...cambios }) => ejecutar(() => Clientes.actualizar(id, cambios)),
  );

  server.registerTool(
    "eliminar_cliente",
    {
      title: "Eliminar cliente",
      description: "Elimina un cliente y todas sus actividades (incluidas las completadas).",
      inputSchema: { id: id("del cliente") },
      annotations: { destructiveHint: true },
    },
    ({ id }) => ejecutar(() => Clientes.eliminar(id)),
  );

  // ── Actividades ──
  server.registerTool(
    "listar_actividades",
    {
      title: "Listar actividades",
      description: "Actividades del cliente: pendientes primero (por fecha de compromiso), luego completadas.",
      inputSchema: { clienteId: id("del cliente") },
      annotations: { readOnlyHint: true },
    },
    ({ clienteId }) => ejecutar(() => Clientes.listarActividades(clienteId)),
  );

  server.registerTool(
    "crear_actividad",
    {
      title: "Crear actividad",
      description: "Agrega un compromiso (actividad pendiente) al cliente.",
      inputSchema: {
        clienteId: id("del cliente"),
        descripcion: z.string().min(1).describe("Qué hay que hacer"),
        fechaCompromiso: fecha.nullable().optional().describe("Fecha de compromiso YYYY-MM-DD (opcional)"),
      },
    },
    ({ clienteId, ...datos }) => ejecutar(() => Clientes.crearActividad(clienteId, datos)),
  );

  server.registerTool(
    "actualizar_actividad",
    {
      title: "Actualizar actividad",
      description: "Edita una actividad pendiente. Las completadas no se pueden editar.",
      inputSchema: {
        clienteId: id("del cliente"),
        actividadId: id("de la actividad"),
        descripcion: z.string().min(1).optional(),
        fechaCompromiso: fecha.nullable().optional().describe("Nueva fecha YYYY-MM-DD, o null para quitarla"),
      },
      annotations: { idempotentHint: true },
    },
    ({ clienteId, actividadId, ...cambios }) => ejecutar(() => Clientes.actualizarActividad(clienteId, actividadId, cambios)),
  );

  server.registerTool(
    "completar_actividad",
    {
      title: "Completar actividad",
      description: "Marca una actividad pendiente como completada, fijando la fecha de ejecución (hoy si se omite).",
      inputSchema: {
        clienteId: id("del cliente"),
        actividadId: id("de la actividad"),
        fecha: fecha.optional().describe("Fecha de finalización YYYY-MM-DD (por defecto hoy)"),
      },
    },
    ({ clienteId, actividadId, fecha }) => ejecutar(() => Clientes.completarActividad(clienteId, actividadId, fecha)),
  );

  server.registerTool(
    "eliminar_actividad",
    {
      title: "Eliminar actividad",
      description: "Elimina una actividad pendiente. Las completadas no se pueden eliminar individualmente.",
      inputSchema: { clienteId: id("del cliente"), actividadId: id("de la actividad") },
      annotations: { destructiveHint: true },
    },
    ({ clienteId, actividadId }) => ejecutar(() => Clientes.eliminarActividad(clienteId, actividadId)),
  );

  return server;
}
