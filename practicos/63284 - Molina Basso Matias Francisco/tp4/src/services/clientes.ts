import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  actividades,
  clientes,
  type Cliente,
  type NuevaActividad,
} from "../db/schema.js";
import {
  normalizarCliente,
  textoBusqueda,
  validarActividad,
} from "./validacion.js";
import {
  estadoActividad,
  fechaHoy,
  type ActividadConEstado,
} from "./estado-actividad.js";

export class ErrorHttp extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export type ClienteConActividades = Cliente & {
  actividades: ActividadConEstado[];
};

export class Clientes {
  static async listar(busqueda = ""): Promise<Cliente[]> {
    const lista = await db
      .select()
      .from(clientes)
      .orderBy(asc(clientes.apellido), asc(clientes.nombre));
    const terminos = textoBusqueda(busqueda).split(" ").filter(Boolean);
    // La agenda es pequeña: filtrar aquí permite buscar Unicode y combinar campos
    // sin extensiones de SQLite ni diferencias entre SQLite local y Turso.
    return lista.filter((cliente) => {
      const campos = Object.values(cliente).map(textoBusqueda);
      return terminos.every((termino) =>
        campos.some((campo) => campo.includes(termino)),
      );
    });
  }

  static async obtener(id: number): Promise<ClienteConActividades> {
    const [cliente] = await db
      .select()
      .from(clientes)
      .where(eq(clientes.id, id));
    if (!cliente) throw new ErrorHttp(404, "Cliente no encontrado.");
    return { ...cliente, actividades: await this.listarActividades(id) };
  }

  static async crear(datos: unknown): Promise<Cliente> {
    const [cliente] = await db
      .insert(clientes)
      .values(normalizarCliente(datos))
      .returning();
    return cliente;
  }

  static async actualizar(id: number, datos: unknown): Promise<Cliente> {
    const [cliente] = await db
      .update(clientes)
      .set(normalizarCliente(datos))
      .where(eq(clientes.id, id))
      .returning();
    if (!cliente) throw new ErrorHttp(404, "Cliente no encontrado.");
    return cliente;
  }

  static async eliminar(id: number): Promise<void> {
    const [, eliminados] = await db.batch([
      db.delete(actividades).where(eq(actividades.clienteId, id)),
      db.delete(clientes).where(eq(clientes.id, id)).returning(),
    ]);
    if (!eliminados.length) throw new ErrorHttp(404, "Cliente no encontrado.");
  }

  static async listarActividades(
    clienteId: number,
  ): Promise<ActividadConEstado[]> {
    const [cliente] = await db
      .select({ id: clientes.id })
      .from(clientes)
      .where(eq(clientes.id, clienteId));
    if (!cliente) throw new ErrorHttp(404, "Cliente no encontrado.");
    const lista = await db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, clienteId))
      .orderBy(
        sql`${actividades.fechaFinalizacion} is not null`,
        asc(actividades.fechaCompromiso),
        asc(actividades.id),
      );
    const hoy = fechaHoy();
    return lista.map((actividad) => estadoActividad(actividad, hoy));
  }

  static async obtenerActividad(
    clienteId: number,
    id: number,
  ): Promise<ActividadConEstado> {
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(and(eq(actividades.id, id), eq(actividades.clienteId, clienteId)));
    if (!actividad) throw new ErrorHttp(404, "Actividad no encontrada.");
    return estadoActividad(actividad);
  }

  static async agregarActividad(
    clienteId: number,
    datos: unknown,
  ): Promise<ActividadConEstado> {
    const valores = validarActividad(datos);
    // Verifica al cliente y crea la actividad en una sola operación.
    const [actividad] = await db
      .insert(actividades)
      .select(
        db
          .select({
            id: sql`null`.as("id"),
            clienteId: clientes.id,
            descripcion: sql`${valores.descripcion}`.as("descripcion"),
            fechaCompromiso: sql`${valores.fechaCompromiso ?? null}`.as(
              "fecha_compromiso",
            ),
            fechaFinalizacion: sql`null`.as("fecha_finalizacion"),
          })
          .from(clientes)
          .where(eq(clientes.id, clienteId)),
      )
      .returning();
    if (!actividad) throw new ErrorHttp(404, "Cliente no encontrado.");
    return estadoActividad(actividad);
  }

  static async modificarActividad(
    clienteId: number,
    id: number,
    datos: unknown,
  ): Promise<ActividadConEstado> {
    return this.guardarActividad(clienteId, id, validarActividad(datos));
  }

  static async completarActividad(
    clienteId: number,
    id: number,
  ): Promise<ActividadConEstado> {
    return this.guardarActividad(clienteId, id, {
      fechaFinalizacion: new Date().toISOString(),
    });
  }

  static async eliminarActividad(clienteId: number, id: number): Promise<void> {
    // Comprobar en el DELETE también protege de una finalización concurrente.
    const [actividad] = await db
      .delete(actividades)
      .where(this.pendiente(clienteId, id))
      .returning();
    if (!actividad) await this.errorActividad(clienteId, id);
  }

  private static pendiente(clienteId: number, id: number) {
    return and(
      eq(actividades.id, id),
      eq(actividades.clienteId, clienteId),
      isNull(actividades.fechaFinalizacion),
    );
  }

  private static async guardarActividad(
    clienteId: number,
    id: number,
    valores: Partial<
      Pick<
        NuevaActividad,
        "descripcion" | "fechaCompromiso" | "fechaFinalizacion"
      >
    >,
  ): Promise<ActividadConEstado> {
    const [actividad] = await db
      .update(actividades)
      .set(valores)
      .where(this.pendiente(clienteId, id))
      .returning();
    if (!actividad) return this.errorActividad(clienteId, id);
    return estadoActividad(actividad);
  }

  private static async errorActividad(
    clienteId: number,
    id: number,
  ): Promise<never> {
    await this.obtenerActividad(clienteId, id);
    throw new ErrorHttp(409, "La actividad completada es de solo lectura.");
  }
}
