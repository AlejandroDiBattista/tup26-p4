import { eq, exists, like, or, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { actividades, clientes, type NuevoCliente } from '../db/schema.js';

export class Clientes {
  static async crear(datos: NuevoCliente) {
    const [cliente] = await db.insert(clientes).values(datos).returning();
    return cliente;
  }

  static async obtenerTodos() {
    return db.select().from(clientes);
  }

  static async obtenerPorId(id: number) {
    return db.query.clientes.findFirst({
      where: eq(clientes.id, id),
      with: { actividades: true },
    });
  }

  static async buscar(texto: string) {
    const termino = `%${texto.trim()}%`;

    return db
      .query.clientes.findMany({
        where: or(
          like(clientes.nombre, termino),
          like(clientes.apellido, termino),
          like(clientes.telefono, termino),
          like(clientes.email, termino),
          exists(
            db.select({ id: actividades.id })
              .from(actividades)
              .where(sql`${actividades.clienteId} = ${clientes.id} AND ${actividades.descripcion} LIKE ${termino}`),
          ),
        ),
        with: { actividades: true },
      });
  }

  static async actualizar(id: number, datos: Partial<NuevoCliente>) {
    const [cliente] = await db
      .update(clientes)
      .set(datos)
      .where(eq(clientes.id, id))
      .returning();
    return cliente;
  }

  static async eliminar(id: number) {
    const [cliente] = await db.delete(clientes).where(eq(clientes.id, id)).returning();
    return cliente;
  }
}
