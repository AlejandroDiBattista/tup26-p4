import { and, eq, isNull, lt, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { actividades, type NuevaActividad } from '../db/schema.js';

export class Actividades {
  static async crear(datos: NuevaActividad) {
    const [actividad] = await db.insert(actividades).values(datos).returning();
    return actividad;
  }

  static async obtenerTodas() {
    return db.select().from(actividades);
  }

  static async obtenerPendientes() {
    return db.select().from(actividades).where(eq(actividades.completa, false));
  }

  static async obtenerVencidas() {
    const ahora = Math.floor(Date.now() / 1000);

    return db
      .select()
      .from(actividades)
      .where(and(
        eq(actividades.completa, false),
        lt(actividades.fechaComprometida, new Date(ahora * 1000)),
      ));
  }

  static async obtenerSinPlazo() {
    return db
      .select()
      .from(actividades)
      .where(and(
        eq(actividades.completa, false),
        isNull(actividades.fechaComprometida),
      ));
  }

  static async obtenerPorId(id: number) {
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(eq(actividades.id, id));
    return actividad;
  }

  static async actualizar(id: number, datos: Partial<NuevaActividad>) {
    const cambios = datos.completa
      ? {
          ...datos,
          fechaRealizacion: sql`CASE
            WHEN ${actividades.completa} = 1
              THEN COALESCE(${actividades.fechaRealizacion}, unixepoch())
            ELSE unixepoch()
          END`,
        }
      : datos;

    const [actividad] = await db
      .update(actividades)
      .set(cambios)
      .where(eq(actividades.id, id))
      .returning();
    return actividad;
  }

  static async completar(id: number) {
    return this.actualizar(id, { completa: true });
  }

  static async eliminar(id: number) {
    const [actividad] = await db
      .delete(actividades)
      .where(eq(actividades.id, id))
      .returning();
    return actividad;
  }
}
