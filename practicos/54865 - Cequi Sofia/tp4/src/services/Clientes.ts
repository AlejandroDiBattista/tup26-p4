import { and, asc, eq, like, or, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { clientes, actividades, type NuevoCliente, type NuevaActividad } from "../db/schema.js";

export class Clientes {
  // Buscar clientes por cualquier campo o traer todos si termino está vacío
  static async buscar(termino: string = "") {
    const q = termino.trim();
    if (!q) {
      return db
        .select()
        .from(clientes)
        .orderBy(asc(clientes.apellido), asc(clientes.nombre))
        .all();
    }

    const pattern = `%${q}%`;
    return db
      .select()
      .from(clientes)
      .where(
        or(
          like(clientes.nombre, pattern),
          like(clientes.apellido, pattern),
          like(clientes.email, pattern),
          like(clientes.telefono, pattern),
          like(clientes.domicilio, pattern),
          like(clientes.localidad, pattern),
          like(sql`CAST(${clientes.id} AS TEXT)`, pattern)
        )
      )
      .orderBy(asc(clientes.apellido), asc(clientes.nombre))
      .all();
  }

  // Obtener cliente por id
  static async obtenerPorId(id: number) {
    const res = db
      .select()
      .from(clientes)
      .where(eq(clientes.id, id))
      .all();
    return res[0] ?? null;
  }

  // Crear cliente
  static async crear(datos: NuevoCliente) {
    const res = db
      .insert(clientes)
      .values({
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        email: datos.email.trim(),
        telefono: datos.telefono?.trim() || null,
        domicilio: datos.domicilio?.trim() || null,
        localidad: datos.localidad?.trim() || null
      })
      .returning()
      .all();
    return res[0];
  }

  // Actualizar cliente
  static async actualizar(id: number, datos: Partial<NuevoCliente>) {
    const payload: Partial<NuevoCliente> = {};
    if (datos.nombre !== undefined) payload.nombre = datos.nombre.trim();
    if (datos.apellido !== undefined) payload.apellido = datos.apellido.trim();
    if (datos.email !== undefined) payload.email = datos.email.trim();
    if (datos.telefono !== undefined) payload.telefono = datos.telefono?.trim() || null;
    if (datos.domicilio !== undefined) payload.domicilio = datos.domicilio?.trim() || null;
    if (datos.localidad !== undefined) payload.localidad = datos.localidad?.trim() || null;

    const res = db
      .update(clientes)
      .set(payload)
      .where(eq(clientes.id, id))
      .returning()
      .all();
    return res[0] ?? null;
  }

  // Eliminar cliente (con sus actividades por clave foránea cascade)
  static async eliminar(id: number) {
    const res = db
      .delete(clientes)
      .where(eq(clientes.id, id))
      .returning()
      .all();
    return res[0] ?? null;
  }

  // --- Actividades del cliente ---

  // Listar actividades de un cliente
  static async listarActividades(clienteId: number) {
    return db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, clienteId))
      .orderBy(asc(actividades.id))
      .all();
  }

  // Agregar actividad
  static async agregarActividad(clienteId: number, datos: { descripcion: string; fechaCompromiso?: string | null }) {
    const res = db
      .insert(actividades)
      .values({
        clienteId,
        descripcion: datos.descripcion.trim(),
        fechaCompromiso: datos.fechaCompromiso?.trim() || null,
        fechaFinalizacion: null
      })
      .returning()
      .all();
    return res[0];
  }

  // Actualizar actividad (solo si no está completada)
  static async actualizarActividad(
    actividadId: number,
    datos: { descripcion?: string; fechaCompromiso?: string | null }
  ) {
    const actividadActual = db
      .select()
      .from(actividades)
      .where(eq(actividades.id, actividadId))
      .all()[0];

    if (!actividadActual) return null;
    if (actividadActual.fechaFinalizacion) {
      throw new Error("No se puede editar una actividad ya completada");
    }

    const payload: Partial<NuevaActividad> = {};
    if (datos.descripcion !== undefined) payload.descripcion = datos.descripcion.trim();
    if (datos.fechaCompromiso !== undefined) {
      payload.fechaCompromiso = datos.fechaCompromiso?.trim() || null;
    }

    const res = db
      .update(actividades)
      .set(payload)
      .where(eq(actividades.id, actividadId))
      .returning()
      .all();
    return res[0] ?? null;
  }

  // Completar actividad (asigna fecha actual si no se proporciona)
  static async completarActividad(actividadId: number, fecha?: string) {
    const fechaFinal = fecha || new Date().toISOString().slice(0, 10);
    const res = db
      .update(actividades)
      .set({ fechaFinalizacion: fechaFinal })
      .where(eq(actividades.id, actividadId))
      .returning()
      .all();
    return res[0] ?? null;
  }

  // Eliminar actividad (solo si no está completada)
  static async eliminarActividad(actividadId: number) {
    const actividadActual = db
      .select()
      .from(actividades)
      .where(eq(actividades.id, actividadId))
      .all()[0];

    if (!actividadActual) return null;
    if (actividadActual.fechaFinalizacion) {
      throw new Error("No se puede eliminar una actividad ya completada");
    }

    const res = db
      .delete(actividades)
      .where(eq(actividades.id, actividadId))
      .returning()
      .all();
    return res[0] ?? null;
  }
}

