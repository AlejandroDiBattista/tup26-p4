import { eq, or, like } from "drizzle-orm";
import { db } from "../db/index.js";
import { clientes, type NuevoCliente } from "../db/schema.js";

export class ClientesRepositorio {
  static listar() {
    return db.select().from(clientes);
  }

  static buscarPorId(id: number) {
    return db.select().from(clientes).where(eq(clientes.id, id)).get();
  }

  static buscar(termino: string) {
    const patron = `%${termino}%`;

    return db
      .select()
      .from(clientes)
      .where(
        or(
          like(clientes.nombre, patron),
          like(clientes.apellido, patron),
          like(clientes.telefono, patron),
          like(clientes.email, patron),
        ),
      );
  }

  static crear(datos: NuevoCliente) {
    return db.insert(clientes).values(datos).returning().get();
  }

  static actualizar(id: number, datos: Partial<NuevoCliente>) {
    return db.update(clientes).set(datos).where(eq(clientes.id, id)).returning().get();
  }

  static eliminar(id: number) {
    return db.delete(clientes).where(eq(clientes.id, id)).returning().get();
  }
}
