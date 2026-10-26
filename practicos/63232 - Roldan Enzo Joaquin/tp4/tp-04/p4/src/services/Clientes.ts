import { and, asc, eq, exists, or, sql } from 'drizzle-orm';
import { ErrorHttp } from '../errors';
import type { BaseDatos } from '../db';
import { actividades, clientes, type Actividad, type NuevaActividad, type NuevaCliente } from '../db/schema';

export class Clientes {
  static listar(db: BaseDatos, busqueda = '') {
    const termino = busqueda.trim();
    const filtrosCliente = [
      sql`instr(lower(cast(${clientes.id} as text)), lower(${termino})) > 0`,
      sql`instr(lower(${clientes.nombre}), lower(${termino})) > 0`,
      sql`instr(lower(${clientes.apellido}), lower(${termino})) > 0`,
      sql`instr(lower(${clientes.email}), lower(${termino})) > 0`,
      sql`instr(lower(${clientes.telefono}), lower(${termino})) > 0`,
      sql`instr(lower(${clientes.empresa}), lower(${termino})) > 0`,
      sql`instr(lower(${clientes.cargo}), lower(${termino})) > 0`,
      sql`instr(lower(${clientes.notas}), lower(${termino})) > 0`,
      sql`instr(lower(${clientes.creadoEn}), lower(${termino})) > 0`,
    ];

    const coincideActividad = exists(
      db
        .select({ id: actividades.id })
        .from(actividades)
        .where(
          and(
            eq(actividades.clienteId, clientes.id),
            or(
              sql`instr(lower(cast(${actividades.id} as text)), lower(${termino})) > 0`,
              sql`instr(lower(${actividades.titulo}), lower(${termino})) > 0`,
              sql`instr(lower(${actividades.descripcion}), lower(${termino})) > 0`,
              sql`instr(lower(${actividades.fecha}), lower(${termino})) > 0`,
              sql`instr(lower(${actividades.creadaEn}), lower(${termino})) > 0`,
              sql`instr(lower(coalesce(${actividades.completadaEn}, '')), lower(${termino})) > 0`,
              sql`instr(lower(case when ${actividades.completada} then 'completada' else 'pendiente' end), lower(${termino})) > 0`,
            ),
          ),
        ),
    );

    return db
      .select()
      .from(clientes)
      .where(termino ? or(...filtrosCliente, coincideActividad) : undefined)
      .orderBy(asc(clientes.apellido), asc(clientes.nombre), asc(clientes.id))
      .all();
  }

  static obtener(db: BaseDatos, id: number) {
    const cliente = db.select().from(clientes).where(eq(clientes.id, id)).get();
    if (!cliente) return null;

    const listaActividades = db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, id))
      .orderBy(asc(actividades.fecha), asc(actividades.id))
      .all();

    return { ...cliente, actividades: listaActividades };
  }

  static crear(db: BaseDatos, datos: NuevaCliente) {
    const creado = db.insert(clientes).values(datos).returning().get();
    return this.obtener(db, creado.id)!;
  }

  static actualizar(db: BaseDatos, id: number, datos: NuevaCliente) {
    const actualizado = db
      .update(clientes)
      .set(datos)
      .where(eq(clientes.id, id))
      .returning({ id: clientes.id })
      .get();

    return actualizado ? this.obtener(db, actualizado.id) : null;
  }

  static eliminar(db: BaseDatos, id: number) {
    return db
      .delete(clientes)
      .where(eq(clientes.id, id))
      .returning({ id: clientes.id })
      .get() ?? null;
  }

  static listarActividades(db: BaseDatos, clienteId: number): Actividad[] | null {
    if (!this.existe(db, clienteId)) return null;
    return db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, clienteId))
      .orderBy(asc(actividades.fecha), asc(actividades.id))
      .all();
  }

  static crearActividad(db: BaseDatos, clienteId: number, datos: Omit<NuevaActividad, 'clienteId'>) {
    if (!this.existe(db, clienteId)) return null;
    const creada = db
      .insert(actividades)
      .values({ ...datos, clienteId })
      .returning()
      .get();
    return creada;
  }

  static actualizarActividad(
    db: BaseDatos,
    clienteId: number,
    actividadId: number,
    datos: Pick<NuevaActividad, 'titulo' | 'descripcion' | 'fecha'>,
  ) {
    const actual = this.obtenerActividad(db, clienteId, actividadId);
    if (!actual) return null;
    if (actual.completada) {
      throw new ErrorHttp(409, 'Las actividades completadas no se pueden editar.');
    }

    return db
      .update(actividades)
      .set(datos)
      .where(and(eq(actividades.id, actividadId), eq(actividades.clienteId, clienteId)))
      .returning()
      .get() ?? null;
  }

  static completarActividad(db: BaseDatos, clienteId: number, actividadId: number) {
    const actual = this.obtenerActividad(db, clienteId, actividadId);
    if (!actual) return null;
    if (actual.completada) return actual;

    return db
      .update(actividades)
      .set({ completada: true, completadaEn: new Date().toISOString() })
      .where(and(eq(actividades.id, actividadId), eq(actividades.clienteId, clienteId)))
      .returning()
      .get() ?? null;
  }

  static eliminarActividad(db: BaseDatos, clienteId: number, actividadId: number) {
    const actual = this.obtenerActividad(db, clienteId, actividadId);
    if (!actual) return null;
    if (actual.completada) {
      throw new ErrorHttp(409, 'Las actividades completadas no se pueden eliminar.');
    }

    return db
      .delete(actividades)
      .where(and(eq(actividades.id, actividadId), eq(actividades.clienteId, clienteId)))
      .returning({ id: actividades.id })
      .get() ?? null;
  }

  private static existe(db: BaseDatos, id: number) {
    return Boolean(db.select({ id: clientes.id }).from(clientes).where(eq(clientes.id, id)).get());
  }

  private static obtenerActividad(db: BaseDatos, clienteId: number, actividadId: number) {
    return db
      .select()
      .from(actividades)
      .where(and(eq(actividades.id, actividadId), eq(actividades.clienteId, clienteId)))
      .get() ?? null;
  }
}
