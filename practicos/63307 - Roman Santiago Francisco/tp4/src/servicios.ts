import { db, clientes, actividades } from './db.js';
import { eq, or, like } from 'drizzle-orm';

export class Clientes {
  static obtenerTodos(busqueda?: string) {
    if (!busqueda) {
      return db.select().from(clientes).all();
    }
    const term = `%${busqueda}%`;
    return db.select().from(clientes).where(
      or(
        like(clientes.nombre, term),
        like(clientes.email, term),
        like(clientes.telefono, term),
        like(clientes.direccion, term)
      )
    ).all();
  }

  static obtenerPorId(id: number) {
    const cliente = db.select().from(clientes).where(eq(clientes.id, id)).get();
    if (!cliente) return null;
    const acts = db.select().from(actividades).where(eq(actividades.clienteId, id)).all();
    return { ...cliente, actividades: acts };
  }

  static crearCliente(data: any) {
    return db.insert(clientes).values(data).run();
  }

  static actualizarCliente(id: number, data: any) {
    return db.update(clientes).set(data).where(eq(clientes.id, id)).run();
  }

  static eliminarCliente(id: number) {
    db.delete(actividades).where(eq(actividades.clienteId, id)).run();
    return db.delete(clientes).where(eq(clientes.id, id)).run();
  }

  static agregarActividad(clienteId: number, data: any) {
    return db.insert(actividades).values({
      clienteId,
      descripcion: data.descripcion,
      fecha: data.fecha || null,
      completada: false
    }).run();
  }

  static actualizarActividad(id: number, data: any) {
    return db.update(actividades).set(data).where(eq(actividades.id, id)).run();
  }

  static eliminarActividad(id: number) {
    return db.delete(actividades).where(eq(actividades.id, id)).run();
  }
}