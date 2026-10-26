import { and, eq, like, or, sql } from "drizzle-orm";
import { db } from "../db";
import { actividades, clientes } from "../db/schema";

export type ClienteNuevo = {
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  empresa?: string;
  notas?: string;
};

export class Clientes {
  static listar(busqueda = "") {
    const termino = `%${busqueda.trim()}%`;
    if (!busqueda.trim()) {
      return db.select().from(clientes).orderBy(clientes.apellido, clientes.nombre).all();
    }
    return db.select().from(clientes).where(or(
      like(clientes.nombre, termino),
      like(clientes.apellido, termino),
      like(clientes.email, termino),
      like(clientes.telefono, termino),
      like(clientes.empresa, termino),
      like(clientes.notas, termino),
      sql`CAST(${clientes.id} AS TEXT) LIKE ${termino}`
    )).orderBy(clientes.apellido, clientes.nombre).all();
  }

  static obtener(id: number) {
    return db.select().from(clientes).where(eq(clientes.id, id)).get();
  }

  static crear(datos: ClienteNuevo) {
    const nombre = datos.nombre?.trim();
    const apellido = datos.apellido?.trim();
    if (!nombre || !apellido) throw new Error("Nombre y apellido son obligatorios.");
    return db.insert(clientes).values({
      nombre,
      apellido,
      email: datos.email?.trim() ?? "",
      telefono: datos.telefono?.trim() ?? "",
      empresa: datos.empresa?.trim() ?? "",
      notas: datos.notas?.trim() ?? ""
    }).returning().get();
  }

  static actualizar(id: number, datos: ClienteNuevo) {
    if (!this.obtener(id)) return undefined;
    const nombre = datos.nombre?.trim();
    const apellido = datos.apellido?.trim();
    if (!nombre || !apellido) throw new Error("Nombre y apellido son obligatorios.");
    return db.update(clientes).set({
      nombre,
      apellido,
      email: datos.email?.trim() ?? "",
      telefono: datos.telefono?.trim() ?? "",
      empresa: datos.empresa?.trim() ?? "",
      notas: datos.notas?.trim() ?? ""
    }).where(eq(clientes.id, id)).returning().get();
  }

  static eliminar(id: number) {
    if (!this.obtener(id)) return false;
    db.delete(actividades).where(eq(actividades.clienteId, id)).run();
    db.delete(clientes).where(eq(clientes.id, id)).run();
    return true;
  }

  static actividadesDe(id: number) {
    return db.select().from(actividades).where(eq(actividades.clienteId, id))
      .orderBy(actividades.fecha, actividades.id).all();
  }

  static agregarActividad(clienteId: number, datos: { titulo: string; descripcion?: string; fecha?: string }) {
    if (!this.obtener(clienteId)) throw new Error("El cliente no existe.");
    if (!datos.titulo?.trim()) throw new Error("El título de la actividad es obligatorio.");
    return db.insert(actividades).values({
      clienteId,
      titulo: datos.titulo.trim(),
      descripcion: datos.descripcion?.trim() ?? "",
      fecha: datos.fecha ?? "",
      completada: false
    }).returning().get();
  }

  static completarActividad(id: number) {
    const actividad = db.select().from(actividades).where(eq(actividades.id, id)).get();
    if (!actividad) return undefined;
    if (actividad.completada) return actividad;
    return db.update(actividades).set({ completada: true })
      .where(eq(actividades.id, id)).returning().get();
  }

  static actualizarActividad(id: number, datos: { titulo: string; descripcion?: string; fecha?: string }) {
    const actividad = db.select().from(actividades).where(eq(actividades.id, id)).get();
    if (!actividad) return undefined;
    if (actividad.completada) throw new Error("No se puede editar una actividad completada.");
    if (!datos.titulo?.trim()) throw new Error("El título de la actividad es obligatorio.");
    return db.update(actividades).set({
      titulo: datos.titulo.trim(),
      descripcion: datos.descripcion?.trim() ?? "",
      fecha: datos.fecha ?? ""
    }).where(and(eq(actividades.id, id), eq(actividades.completada, false))).returning().get();
  }

  static eliminarActividad(id: number) {
    const actividad = db.select().from(actividades).where(eq(actividades.id, id)).get();
    if (!actividad) return false;
    if (actividad.completada) throw new Error("No se puede eliminar una actividad completada.");
    db.delete(actividades).where(eq(actividades.id, id)).run();
    return true;
  }
}
