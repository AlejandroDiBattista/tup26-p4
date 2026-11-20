import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { Clientes } from "../clientes/clientes.js";
import { ErrorConflicto, ErrorNoEncontrado, ErrorValidacion } from "../clientes/errores.js";

/* ---------- Respuestas: éxito en JSON y errores de negocio con isError ---------- */
const texto = (t: string, isError = false): CallToolResult => ({ content: [{ type: "text", text: t }], isError });

async function ejecutar(accion: () => Promise<unknown>): Promise<CallToolResult> {
  try {
    return texto(JSON.stringify((await accion()) ?? { ok: true }, null, 2));
  } catch (e) {
    if (e instanceof ErrorNoEncontrado) return texto(`No encontrado: ${e.message}`, true);
    if (e instanceof ErrorValidacion) return texto(`Datos inválidos: ${e.message}`, true);
    if (e instanceof ErrorConflicto) return texto(`Operación no permitida: ${e.message}`, true);
    console.error(e);
    return texto("Error interno del servidor", true);
  }
}

/* ---------- Esquemas de entrada ---------- */
const id = (que: string) => z.number().int().positive().describe(`Id numérico ${que}`);
const fecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD");
const opcionalTexto = (d: string) => z.string().nullable().optional().describe(`${d} (null o vacío para borrarlo)`);

const datosCliente = {
  nombre: z.string().describe("Nombre (se normaliza a formato título)"),
  apellido: z.string().describe("Apellido (se normaliza a formato título)"),
  email: z.string().describe("Email único (se guarda en minúsculas)"),
  domicilio: opcionalTexto("Domicilio"),
  localidad: opcionalTexto("Localidad"),
  telefono: opcionalTexto("Teléfono (se guardan solo dígitos y un + inicial)"),
};

const datosActividad = {
  descripcion: z.string().describe("Descripción de la actividad"),
  fechaCompromiso: fecha.nullable().optional().describe("Fecha de compromiso YYYY-MM-DD; null o ausente = sin fecha"),
};

const LECTURA = { readOnlyHint: true } as const;
const ESCRITURA = { readOnlyHint: false, destructiveHint: false } as const;
const BORRADO = { readOnlyHint: false, destructiveHint: true } as const;

/** Crea un servidor MCP cuyas herramientas delegan en el servicio `Clientes` (las mismas reglas que REST). */
export function createMcpServer() {
  const server = new McpServer({ name: "clientes", version: "1.0.0" });

  /* ----- Clientes ----- */
  server.registerTool("buscar_clientes", {
    title: "Buscar clientes",
    description:
      "Lista clientes con sus actividades (cada una con su estado: completada, vencida o pendiente). " +
      "Los filtros son por coincidencia parcial y se combinan; `q` busca en todos los campos de texto o por id (ej. \"#12\").",
    inputSchema: {
      nombre: z.string().optional(), apellido: z.string().optional(), email: z.string().optional(),
      domicilio: z.string().optional(), localidad: z.string().optional(), telefono: z.string().optional(),
      q: z.string().optional().describe("Búsqueda libre en cualquier campo"),
    },
    annotations: LECTURA,
  }, (filtro) => ejecutar(() => Clientes.buscar(filtro)));

  server.registerTool("obtener_cliente", {
    title: "Obtener cliente",
    description: "Devuelve un cliente con todas sus actividades.",
    inputSchema: { id: id("del cliente") },
    annotations: LECTURA,
  }, ({ id }) => ejecutar(async () => {
    await Clientes.cliente(id);
    return Clientes.obtener(id);
  }));

  server.registerTool("crear_cliente", {
    title: "Crear cliente",
    description: "Crea un cliente, opcionalmente con actividades iniciales (si alguna falla, no se crea nada).",
    inputSchema: {
      ...datosCliente,
      actividades: z.array(z.object(datosActividad)).optional().describe("Actividades iniciales"),
    },
    annotations: ESCRITURA,
  }, ({ actividades, ...datos }) => ejecutar(async () => {
    const cliente = await Clientes.crear(datos, actividades as never);
    return Clientes.obtener(cliente.id);
  }));

  server.registerTool("actualizar_cliente", {
    title: "Actualizar cliente",
    description: "Modifica solo los campos indicados de un cliente.",
    inputSchema: {
      id: id("del cliente"),
      nombre: datosCliente.nombre.optional(), apellido: datosCliente.apellido.optional(), email: datosCliente.email.optional(),
      domicilio: datosCliente.domicilio, localidad: datosCliente.localidad, telefono: datosCliente.telefono,
    },
    annotations: ESCRITURA,
  }, ({ id, ...cambios }) => ejecutar(async () => {
    await Clientes.actualizar(id, cambios);
    return Clientes.obtener(id);
  }));

  server.registerTool("eliminar_cliente", {
    title: "Eliminar cliente",
    description: "Elimina un cliente y TODAS sus actividades, incluidas las completadas. No se puede deshacer.",
    inputSchema: { id: id("del cliente") },
    annotations: BORRADO,
  }, ({ id }) => ejecutar(() => Clientes.eliminar(id)));

  /* ----- Actividades (siempre dentro de su cliente) ----- */
  server.registerTool("buscar_actividades", {
    title: "Buscar actividades",
    description:
      "Lista actividades de un cliente. Estados: completada (tiene fecha de finalización), " +
      "vencida (compromiso anterior a hoy y sin completar) y pendiente (sin fecha o con fecha de hoy en adelante).",
    inputSchema: {
      clienteId: id("del cliente"),
      descripcion: z.string().optional().describe("Texto contenido en la descripción"),
      estado: z.enum(["completada", "vencida", "pendiente"]).optional(),
      compromisoDesde: fecha.optional(), compromisoHasta: fecha.optional(),
      finalizacionDesde: fecha.optional(), finalizacionHasta: fecha.optional(),
    },
    annotations: LECTURA,
  }, (filtro) => ejecutar(async () => {
    await Clientes.cliente(filtro.clienteId);
    return Clientes.buscarActividades(filtro);
  }));

  server.registerTool("crear_actividad", {
    title: "Crear actividad",
    description: "Agrega una actividad pendiente a un cliente. No puede repetir la descripción de otra del mismo cliente.",
    inputSchema: { clienteId: id("del cliente"), ...datosActividad },
    annotations: ESCRITURA,
  }, ({ clienteId, ...datos }) => ejecutar(() => Clientes.crearActividad(clienteId, datos)));

  server.registerTool("actualizar_actividad", {
    title: "Actualizar actividad",
    description: "Modifica descripción y/o fecha de compromiso de una actividad NO completada. Las completadas no se pueden editar.",
    inputSchema: {
      clienteId: id("del cliente dueño de la actividad"), id: id("de la actividad"),
      descripcion: datosActividad.descripcion.optional(), fechaCompromiso: datosActividad.fechaCompromiso,
    },
    annotations: ESCRITURA,
  }, ({ clienteId, id, ...cambios }) => ejecutar(async () => {
    await Clientes.actividad(clienteId, id);
    return Clientes.actualizarActividad(id, cambios);
  }));

  server.registerTool("completar_actividad", {
    title: "Completar actividad",
    description: "Marca la actividad como completada con su fecha de ejecución (hoy por defecto). Después ya no se puede editar ni borrar.",
    inputSchema: {
      clienteId: id("del cliente dueño de la actividad"), id: id("de la actividad"),
      fecha: fecha.optional().describe("Fecha de ejecución YYYY-MM-DD; hoy si se omite"),
    },
    annotations: ESCRITURA,
  }, ({ clienteId, id, fecha }) => ejecutar(async () => {
    await Clientes.actividad(clienteId, id);
    return Clientes.completarActividad(id, fecha);
  }));

  server.registerTool("eliminar_actividad", {
    title: "Eliminar actividad",
    description: "Elimina una actividad NO completada. Las completadas solo desaparecen al eliminar su cliente.",
    inputSchema: { clienteId: id("del cliente dueño de la actividad"), id: id("de la actividad") },
    annotations: BORRADO,
  }, ({ clienteId, id }) => ejecutar(async () => {
    await Clientes.actividad(clienteId, id);
    await Clientes.eliminarActividad(id);
  }));

  return server;
}
