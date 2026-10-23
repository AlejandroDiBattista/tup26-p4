import { and, eq, like, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { actividades, clientes, type NuevoCliente } from "../db/schema.js";

export class Clientes {
  static listar(busqueda = "") {
    const termino = busqueda.trim();
    if (!termino) return db.select().from(clientes).orderBy(clientes.nombre).all();
    const patron = `%${termino.replace(/[\\%_]/g, "\\$&")}%`;
    return db.select().from(clientes).where(or(
      like(clientes.nombre, patron), like(clientes.email, patron),
      like(clientes.telefono, patron), like(clientes.direccion, patron),
    )).orderBy(clientes.nombre).all();
  }

  static obtener(id: number) {
    const cliente = db.select().from(clientes).where(eq(clientes.id, id)).get();
    if (!cliente) return undefined;
    const listaActividades = db.select().from(actividades)
      .where(eq(actividades.clienteId, id)).all();
    return { ...cliente, actividades: listaActividades };
  }

  static crear(datos: NuevoCliente) {
    return db.insert(clientes).values(datos).returning().get();
  }

  static actualizar(id: number, datos: Partial<Omit<NuevoCliente, "id">>) {
    return db.update(clientes).set(datos).where(eq(clientes.id, id)).returning().get();
  }

  static eliminar(id: number) {
    return db.delete(clientes).where(eq(clientes.id, id)).returning().get();
  }
}

export class Actividades {
  static crear(clienteId: number, descripcion: string, fecha?: string) {
    return db.insert(actividades).values({ clienteId, descripcion, fecha: fecha || null })
      .returning().get();
  }

  static actualizar(id: number, clienteId: number, descripcion: string, fecha?: string) {
    const actividad = db.select().from(actividades)
      .where(and(eq(actividades.id, id), eq(actividades.clienteId, clienteId))).get();
    if (!actividad || actividad.completada) return undefined;
    return db.update(actividades).set({ descripcion, fecha: fecha || null })
      .where(eq(actividades.id, id)).returning().get();
  }

  static completar(id: number, clienteId: number) {
    return db.update(actividades).set({ completada: true })
      .where(and(eq(actividades.id, id), eq(actividades.clienteId, clienteId), eq(actividades.completada, false)))
      .returning().get();
  }

  static eliminar(id: number, clienteId: number) {
    return db.delete(actividades).where(and(
      eq(actividades.id, id), eq(actividades.clienteId, clienteId), eq(actividades.completada, false),
    )).returning().get();
  }
}
