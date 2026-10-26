import { and, eq, lt } from "drizzle-orm";
import { db } from "../db/index.js";
import { actividades, type NuevaActividad } from "../db/schema.js";

export class ActividadesRepositorio {
  static listar() {
    return db.select().from(actividades);
  }

  static listarPorCliente(clienteId: number) {
    return db.select().from(actividades).where(eq(actividades.clienteId, clienteId));
  }

  static listarPendientes() {
    return db.select().from(actividades).where(eq(actividades.estado, "pendiente"));
  }

  static listarVencidas() {
    return db
      .select()
      .from(actividades)
      .where(and(eq(actividades.estado, "pendiente"), lt(actividades.fecha, new Date())));
  }

  static listarCompletadas() {
    return db.select().from(actividades).where(eq(actividades.estado, "completa"));
  }

  static buscarPorId(id: number) {
    return db.select().from(actividades).where(eq(actividades.id, id)).get();
  }

  static crear(datos: NuevaActividad) {
    return db.insert(actividades).values(datos).returning().get();
  }

  static actualizar(id: number, datos: Partial<NuevaActividad>) {
    return db.update(actividades).set(datos).where(eq(actividades.id, id)).returning().get();
  }

  static eliminar(id: number) {
    return db.delete(actividades).where(eq(actividades.id, id)).returning().get();
  }
}
