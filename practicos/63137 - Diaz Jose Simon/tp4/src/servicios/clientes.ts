import { asc, eq, like, or } from 'drizzle-orm';
import { baseDeDatos } from '../db/conexion.ts';
import { actividades, clientes } from '../db/esquema.ts';
import { ErrorDeNegocio, NO_ENCONTRADO } from './errores.ts';

type DatosCliente = Omit<typeof clientes.$inferInsert, 'id'>;

const CAMPOS_BUSCABLES = [clientes.nombre, clientes.email, clientes.telefono, clientes.direccion];

function tomarCampos({ nombre, email, telefono, direccion }: DatosCliente): DatosCliente {
  return { nombre, email, telefono, direccion };
}

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
    if (!cliente) throw new ErrorDeNegocio(NO_ENCONTRADO, 'El cliente no existe');
    const actividadesDelCliente = await baseDeDatos
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, id))
      .orderBy(asc(actividades.fecha));
    return { ...cliente, actividades: actividadesDelCliente };
  }

  static async crear(datos: DatosCliente) {
    const [cliente] = await baseDeDatos.insert(clientes).values(tomarCampos(datos)).returning();
    return cliente;
  }

  static async actualizar(id: number, datos: DatosCliente) {
    const [cliente] = await baseDeDatos
      .update(clientes)
      .set(tomarCampos(datos))
      .where(eq(clientes.id, id))
      .returning();
    if (!cliente) throw new ErrorDeNegocio(NO_ENCONTRADO, 'El cliente no existe');
    return cliente;
  }

  static async eliminar(id: number) {
    const borrados = await baseDeDatos.delete(clientes).where(eq(clientes.id, id)).returning();
    if (borrados.length === 0) throw new ErrorDeNegocio(NO_ENCONTRADO, 'El cliente no existe');
  }
}
