import { and, asc, eq, or, like } from "drizzle-orm";
import { actividades, clientes } from "../db/schema.js";
import { db } from "../db/client.js";

type ClienteInput = {
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
};

type ActividadInput = {
  descripcion: string;
  fecha?: string | null;
};

const ahora = () => new Date().toISOString();

export class Clientes {
  static listar(busqueda = "") {
    const termino = `%${busqueda.trim()}%`;
    const filas = busqueda.trim()
      ? db.select().from(clientes).where(or(
          like(clientes.nombre, termino),
          like(clientes.email, termino),
          like(clientes.telefono, termino),
          like(clientes.direccion, termino)
        )).orderBy(asc(clientes.nombre)).all()
      : db.select().from(clientes).orderBy(asc(clientes.nombre)).all();

    return filas.map((cliente) => ({ ...cliente, actividades: this.actividadesDe(cliente.id) }));
  }

  static obtener(id: number) {
    const cliente = db.select().from(clientes).where(eq(clientes.id, id)).get();
    return cliente ? { ...cliente, actividades: this.actividadesDe(id) } : undefined;
  }

  static crear(input: ClienteInput) {
    const cliente = db.insert(clientes).values({
      nombre: input.nombre.trim(),
      email: input.email.trim(),
      telefono: input.telefono?.trim() ?? "",
      direccion: input.direccion?.trim() ?? "",
      creadoEn: ahora()
    }).returning().get();
    return { ...cliente, actividades: [] };
  }

  static actualizar(id: number, input: ClienteInput) {
    const cliente = db.update(clientes).set({
      nombre: input.nombre.trim(),
      email: input.email.trim(),
      telefono: input.telefono?.trim() ?? "",
      direccion: input.direccion?.trim() ?? ""
    }).where(eq(clientes.id, id)).returning().get();
    return cliente ? { ...cliente, actividades: this.actividadesDe(id) } : undefined;
  }

  static eliminar(id: number) {
    return db.delete(clientes).where(eq(clientes.id, id)).run().changes > 0;
  }

  static agregarActividad(clienteId: number, input: ActividadInput) {
    const actividad = db.insert(actividades).values({
      clienteId,
      descripcion: input.descripcion.trim(),
      fecha: input.fecha || null,
      creadaEn: ahora()
    }).returning().get();
    return actividad;
  }

  static actualizarActividad(id: number, input: ActividadInput) {
    return db.update(actividades).set({
      descripcion: input.descripcion.trim(),
      fecha: input.fecha || null
    }).where(and(eq(actividades.id, id), eq(actividades.completada, false))).returning().get();
  }

  static completarActividad(id: number) {
    return db.update(actividades).set({ completada: true, completadaEn: ahora() })
      .where(and(eq(actividades.id, id), eq(actividades.completada, false))).returning().get();
  }

  static eliminarActividad(id: number) {
    return db.delete(actividades).where(and(eq(actividades.id, id), eq(actividades.completada, false))).run().changes > 0;
  }

  private static actividadesDe(clienteId: number) {
    return db.select().from(actividades).where(eq(actividades.clienteId, clienteId))
      .orderBy(asc(actividades.completada), asc(actividades.fecha), asc(actividades.id)).all();
  }
}
