import { asc, eq, like, or } from 'drizzle-orm';
import { db } from '../db/client.js';
import { actividades, clientes } from '../db/schema.js';

export type Cliente = typeof clientes.$inferSelect;
export type NuevoCliente = typeof clientes.$inferInsert;
export type Actividad = typeof actividades.$inferSelect;
export type NuevaActividad = typeof actividades.$inferInsert;

export class Clientes {
  static listar(busqueda = ''): Cliente[] {
    const texto = busqueda.trim();

    if (!texto) {
      return db.select().from(clientes).orderBy(asc(clientes.nombre)).all();
    }

    const patron = `%${texto}%`;

    return db
      .select()
      .from(clientes)
      .where(or(
        like(clientes.nombre, patron),
        like(clientes.email, patron),
        like(clientes.telefono, patron),
        like(clientes.direccion, patron),
      ))
      .orderBy(asc(clientes.nombre))
      .all();
  }

  static obtener(id: number): Cliente | undefined {
    return db.select().from(clientes).where(eq(clientes.id, id)).get();
  }

  static crear(datos: NuevoCliente): Cliente {
    const resultado = db.insert(clientes).values(datos).run();
    const cliente = this.obtener(Number(resultado.lastInsertRowid));

    if (!cliente) throw new Error('No se pudo crear el cliente.');
    return cliente;
  }

  static actualizar(
    id: number,
    datos: Partial<Omit<NuevoCliente, 'id'>>,
  ): Cliente | undefined {
    db.update(clientes).set(datos).where(eq(clientes.id, id)).run();
    return this.obtener(id);
  }

  static eliminar(id: number): boolean {
    const resultado = db.delete(clientes).where(eq(clientes.id, id)).run();
    return resultado.changes > 0;
  }

  static listarActividades(clienteId: number): Actividad[] {
    return db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, clienteId))
      .orderBy(asc(actividades.completada), asc(actividades.fecha))
      .all();
  }

  static crearActividad(
    clienteId: number,
    datos: Omit<NuevaActividad, 'id' | 'clienteId' | 'completada' | 'fechaCompletada'>,
  ): Actividad {
    if (!this.obtener(clienteId)) throw new Error('El cliente no existe.');

    const resultado = db.insert(actividades).values({
      ...datos,
      clienteId,
      completada: false,
    }).run();

    const actividad = db
      .select()
      .from(actividades)
      .where(eq(actividades.id, Number(resultado.lastInsertRowid)))
      .get();

    if (!actividad) throw new Error('No se pudo crear la actividad.');
    return actividad;
  }

  static completarActividad(id: number): Actividad | undefined {
    const actividad = this.obtenerActividad(id);
    if (!actividad) return undefined;
    if (actividad.completada) return actividad;

    db.update(actividades)
      .set({
        completada: true,
        fechaCompletada: new Date().toISOString(),
      })
      .where(eq(actividades.id, id))
      .run();

    return this.obtenerActividad(id);
  }

  static actualizarActividad(
    id: number,
    datos: Partial<Pick<NuevaActividad, 'descripcion' | 'fecha'>>,
  ): Actividad | undefined {
    const actividad = this.obtenerActividad(id);
    if (!actividad) return undefined;
    if (actividad.completada) {
      throw new Error('Las actividades completadas no se pueden editar.');
    }

    db.update(actividades).set(datos).where(eq(actividades.id, id)).run();
    return this.obtenerActividad(id);
  }

  static eliminarActividad(id: number): boolean {
    const actividad = this.obtenerActividad(id);
    if (!actividad) return false;
    if (actividad.completada) {
      throw new Error('Las actividades completadas no se pueden eliminar.');
    }

    const resultado = db.delete(actividades).where(eq(actividades.id, id)).run();
    return resultado.changes > 0;
  }

  private static obtenerActividad(id: number): Actividad | undefined {
    return db.select().from(actividades).where(eq(actividades.id, id)).get();
  }
}
