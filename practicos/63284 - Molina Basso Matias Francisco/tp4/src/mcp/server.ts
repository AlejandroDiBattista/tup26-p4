import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { Clientes, ErrorHttp } from "../services/clientes.js";
import { actividadSchema, clienteSchema } from "../services/validacion.js";

const id = z
  .number()
  .int()
  .positive()
  .describe("Identificador entero positivo");
const clienteId = { clienteId: id };
const actividadId = { ...clienteId, actividadId: id };

async function resultado(
  operacion: () => Promise<unknown>,
): Promise<CallToolResult> {
  try {
    const datos = await operacion();
    return {
      content: [{ type: "text", text: JSON.stringify(datos ?? { ok: true }) }],
    };
  } catch (error) {
    let mensaje = "No se pudo realizar la operación.";
    if (error instanceof ErrorHttp) mensaje = error.message;
    else if (error instanceof z.ZodError) {
      mensaje =
        "Datos inválidos: " +
        error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ");
    } else console.error(error);
    return { isError: true, content: [{ type: "text", text: mensaje }] };
  }
}

// Cada herramienta delega en el mismo servicio que utiliza REST.
export function crearServidorMcp() {
  const server = new McpServer({ name: "minicrm", version: "1.0.0" });
  server.registerTool(
    "listar_clientes",
    {
      description:
        "Lista clientes. Busca por cualquier campo; admite palabras combinadas e ignora acentos y mayúsculas.",
      inputSchema: { busqueda: z.string().optional() },
    },
    ({ busqueda }) => resultado(() => Clientes.listar(busqueda)),
  );
  server.registerTool(
    "obtener_cliente",
    {
      description: "Consulta un cliente y sus actividades por ID.",
      inputSchema: clienteId,
    },
    ({ clienteId }) => resultado(() => Clientes.obtener(clienteId)),
  );
  server.registerTool(
    "agregar_cliente",
    {
      description: "Agrega un cliente y normaliza sus datos.",
      inputSchema: { datos: clienteSchema },
    },
    ({ datos }) => resultado(() => Clientes.crear(datos)),
  );
  server.registerTool(
    "editar_cliente",
    {
      description:
        "Reemplaza los datos del cliente. Requiere nombre, apellido y email; opcionales omitidos se vacían.",
      inputSchema: { ...clienteId, datos: clienteSchema },
    },
    ({ clienteId, datos }) =>
      resultado(() => Clientes.actualizar(clienteId, datos)),
  );
  server.registerTool(
    "eliminar_cliente",
    {
      description:
        "Elimina el cliente y todas sus actividades, incluidas las completadas.",
      inputSchema: clienteId,
    },
    ({ clienteId }) => resultado(() => Clientes.eliminar(clienteId)),
  );
  server.registerTool(
    "listar_actividades",
    {
      description:
        "Lista las actividades de un cliente con sus estados y fechas.",
      inputSchema: clienteId,
    },
    ({ clienteId }) => resultado(() => Clientes.listarActividades(clienteId)),
  );
  server.registerTool(
    "obtener_actividad",
    {
      description: "Consulta una actividad perteneciente al cliente indicado.",
      inputSchema: actividadId,
    },
    ({ clienteId, actividadId }) =>
      resultado(() => Clientes.obtenerActividad(clienteId, actividadId)),
  );
  server.registerTool(
    "agregar_actividad",
    {
      description:
        "Agrega una actividad pendiente. La fecha de compromiso es opcional, con formato YYYY-MM-DD.",
      inputSchema: { ...clienteId, datos: actividadSchema },
    },
    ({ clienteId, datos }) =>
      resultado(() => Clientes.agregarActividad(clienteId, datos)),
  );
  server.registerTool(
    "editar_actividad",
    {
      description:
        "Reemplaza descripción y compromiso de una actividad pendiente. Las completadas son de solo lectura.",
      inputSchema: { ...actividadId, datos: actividadSchema },
    },
    ({ clienteId, actividadId, datos }) =>
      resultado(() =>
        Clientes.modificarActividad(clienteId, actividadId, datos),
      ),
  );
  server.registerTool(
    "eliminar_actividad",
    {
      description:
        "Elimina una actividad pendiente del cliente. No permite eliminar completadas individualmente.",
      inputSchema: actividadId,
    },
    ({ clienteId, actividadId }) =>
      resultado(() => Clientes.eliminarActividad(clienteId, actividadId)),
  );
  server.registerTool(
    "completar_actividad",
    {
      description:
        "Completa una actividad pendiente con la fecha de ejecución del servidor; queda de solo lectura.",
      inputSchema: actividadId,
    },
    ({ clienteId, actividadId }) =>
      resultado(() => Clientes.completarActividad(clienteId, actividadId)),
  );
  return server;
}
