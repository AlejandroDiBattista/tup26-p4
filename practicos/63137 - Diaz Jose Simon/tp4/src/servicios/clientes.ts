import { asc, eq, like, or } from 'drizzle-orm';
import { baseDeDatos } from '../db/conexion.ts';
import { actividades, clientes } from '../db/esquema.ts';

type DatosCliente = typeof clientes.$inferInsert;

const CAMPOS_BUSCABLES = [clientes.nombre, clientes.email, clientes.telefono, clientes.direccion];

export class Clientes {
  static listar(texto = '') {
    const patron = `%${texto}%`;
    return baseDeDatos
      .select()
      .from(clientes)
      .where(or(...CAMPOS_BUSCABLES.map((campo) => like(campo, patron))))
      .orderBy(asc(clientes.nombre));
  }

  static async obtener(id: number) {
    const [cliente] = await baseDeDatos.select().from(clientes).where(eq(clientes.id, id));
    const actividadesDelCliente = await baseDeDatos.select().from(actividades).where(eq(actividades.clienteId, id));
    return { ...cliente, actividades: actividadesDelCliente };
  }

  static async crear(datos: DatosCliente) {
    const [cliente] = await baseDeDatos.insert(clientes).values(datos).returning();
    return cliente;
  }

  static async actualizar(id: number, datos: DatosCliente) {
    const [cliente] = await baseDeDatos.update(clientes).set(datos).where(eq(clientes.id, id)).returning();
    return cliente;
  }

  static async eliminar(id: number) {
    await baseDeDatos.delete(clientes).where(eq(clientes.id, id));
  }
}
