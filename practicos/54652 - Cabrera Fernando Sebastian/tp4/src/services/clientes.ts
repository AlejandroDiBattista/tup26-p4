import { eq, like, or, sql } from 'drizzle-orm'
import { db } from '../db/index'
import { clientes } from '../db/schema'

export class ClienteService {
  static obtenerTodos() {
    return db.select().from(clientes).all()
  }

  static obtenerPorId(id: number) {
    return db.select().from(clientes).where(eq(clientes.id, id)).all()
  }

  static crear(datos: typeof clientes.$inferInsert) {
    return db.insert(clientes).values(datos).returning().all()
  }

  static actualizar(id: number, datos: Partial<typeof clientes.$inferInsert>) {
    return db.update(clientes).set(datos).where(eq(clientes.id, id)).returning().all()
  }

  static eliminar(id: number) {
    return db.delete(clientes).where(eq(clientes.id, id)).returning().all()
  }

  static buscar(texto: string) {
    const coincidencia = `%${texto}%`
    

    return db.select().from(clientes).where(
      or(
        sql`${clientes.id} LIKE ${coincidencia}`,
        like(clientes.nombre, coincidencia),
        like(clientes.empresa, coincidencia),
        like(clientes.email, coincidencia),
        like(clientes.telefono, coincidencia),
        like(clientes.direccion, coincidencia),
        like(clientes.notas, coincidencia),

        static buscar(texto: string) {
    return db.select().from(clientes).where(
        or(
            like(clientes.nombre, `%${texto}%`),
            like(clientes.email, `%${texto}%`),
            like(clientes.empresa, `%${texto}%`),
            like(clientes.telefono, `%${texto}%`)
        )
    )
}
      ),
    ).all()
  }
}
