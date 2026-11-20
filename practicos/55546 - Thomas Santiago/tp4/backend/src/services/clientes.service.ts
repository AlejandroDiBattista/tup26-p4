import { desc, eq, like, or } from 'drizzle-orm';

import { db } from '../db.js';
import { actividades, clientes } from '../db/schema.js';

export type ClientePayload = {
  nombre?: string;
  apellido?: string;
  email?: string | null;
  telefono?: string | null;
  empresa?: string | null;
  direccion?: string | null;
  notas?: string | null;
};

export type ActividadPayload = {
  titulo?: string;
  descripcion?: string | null;
  fecha?: string;
  completada?: boolean;
};

const normalizeString = (value: string | null | undefined) => value?.trim() ?? '';
const stamp = () => new Date().toISOString();

const getClienteWithActividades = async (cliente: (typeof clientes)['$inferSelect']) => {
  const actividadesCliente = await db
    .select()
    .from(actividades)
    .where(eq(actividades.clienteId, cliente.id))
    .orderBy(desc(actividades.fecha), desc(actividades.createdAt));

  return {
    ...cliente,
    actividades: actividadesCliente
  };
};

export class Clientes {
  static async listarTodos(search = '') {
    const term = normalizeString(search);
    const rows = term
      ? await db
          .select()
          .from(clientes)
          .where(
            or(
              like(clientes.nombre, `%${term}%`),
              like(clientes.apellido, `%${term}%`),
              like(clientes.email, `%${term}%`),
              like(clientes.telefono, `%${term}%`),
              like(clientes.empresa, `%${term}%`),
              like(clientes.direccion, `%${term}%`),
              like(clientes.notas, `%${term}%`)
            )
          )
          .orderBy(desc(clientes.updatedAt))
      : await db.select().from(clientes).orderBy(desc(clientes.updatedAt));

    const result = [] as Array<(typeof clientes)['$inferSelect'] & { actividades: (typeof actividades)['$inferSelect'][] }>;

    for (const cliente of rows) {
      result.push(await getClienteWithActividades(cliente));
    }

    return result;
  }

  static async buscar(search: string) {
    return this.listarTodos(search);
  }

  static async obtenerPorId(id: number) {
    const row = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
    if (!row[0]) {
      return null;
    }

    return getClienteWithActividades(row[0]);
  }

  static async crear(data: ClientePayload) {
    const nombre = normalizeString(data.nombre);
    const apellido = normalizeString(data.apellido);

    if (!nombre || !apellido) {
      throw new Error('Nombre y apellido son obligatorios.');
    }

    const nuevoCliente = await db
      .insert(clientes)
      .values({
        nombre,
        apellido,
        email: normalizeString(data.email),
        telefono: normalizeString(data.telefono),
        empresa: normalizeString(data.empresa),
        direccion: normalizeString(data.direccion),
        notas: normalizeString(data.notas),
        createdAt: stamp(),
        updatedAt: stamp()
      })
      .returning();

    return this.obtenerPorId(nuevoCliente[0].id);
  }

  static async actualizar(id: number, data: ClientePayload) {
    const actual = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
    if (!actual[0]) {
      return null;
    }

    const payload = {
      nombre: data.nombre !== undefined ? normalizeString(data.nombre) : actual[0].nombre,
      apellido: data.apellido !== undefined ? normalizeString(data.apellido) : actual[0].apellido,
      email: data.email !== undefined ? normalizeString(data.email) : actual[0].email,
      telefono: data.telefono !== undefined ? normalizeString(data.telefono) : actual[0].telefono,
      empresa: data.empresa !== undefined ? normalizeString(data.empresa) : actual[0].empresa,
      direccion: data.direccion !== undefined ? normalizeString(data.direccion) : actual[0].direccion,
      notas: data.notas !== undefined ? normalizeString(data.notas) : actual[0].notas,
      updatedAt: stamp()
    };

    if (!payload.nombre || !payload.apellido) {
      throw new Error('Nombre y apellido son obligatorios.');
    }

    await db
      .update(clientes)
      .set(payload)
      .where(eq(clientes.id, id));

    return this.obtenerPorId(id);
  }

  static async eliminar(id: number) {
    const actual = await this.obtenerPorId(id);
    if (!actual) {
      return false;
    }

    await db.delete(clientes).where(eq(clientes.id, id));
    return true;
  }

  static async listarActividades(clienteId: number) {
    return db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, clienteId))
      .orderBy(desc(actividades.fecha), desc(actividades.createdAt));
  }

  static async crearActividad(clienteId: number, data: ActividadPayload) {
    const cliente = await this.obtenerPorId(clienteId);
    if (!cliente) {
      throw new Error('Cliente no encontrado.');
    }

    const titulo = normalizeString(data.titulo);
    if (!titulo) {
      throw new Error('El título de la actividad es obligatorio.');
    }

    const fecha = normalizeString(data.fecha) || new Date().toISOString().slice(0, 10);

    const nuevo = await db
      .insert(actividades)
      .values({
        clienteId,
        titulo,
        descripcion: normalizeString(data.descripcion),
        fecha,
        completada: Boolean(data.completada),
        createdAt: stamp(),
        updatedAt: stamp()
      })
      .returning();

    await db.update(clientes).set({ updatedAt: stamp() }).where(eq(clientes.id, clienteId));

    return nuevo[0];
  }

  static async actualizarActividad(id: number, data: ActividadPayload) {
    const actual = await db.select().from(actividades).where(eq(actividades.id, id)).limit(1);
    if (!actual[0]) {
      return null;
    }

    if (actual[0].completada) {
      throw new Error('No se puede editar una actividad completada.');
    }

    const payload = {
      titulo: data.titulo !== undefined ? normalizeString(data.titulo) : actual[0].titulo,
      descripcion: data.descripcion !== undefined ? normalizeString(data.descripcion) : actual[0].descripcion,
      fecha: data.fecha !== undefined ? normalizeString(data.fecha) || actual[0].fecha : actual[0].fecha,
      completada: data.completada !== undefined ? Boolean(data.completada) : actual[0].completada,
      updatedAt: stamp()
    };

    if (!payload.titulo) {
      throw new Error('El título de la actividad es obligatorio.');
    }

    await db.update(actividades).set(payload).where(eq(actividades.id, id));
    await db.update(clientes).set({ updatedAt: stamp() }).where(eq(clientes.id, actual[0].clienteId));

    return this.getActividadById(id);
  }

  static async getActividadById(id: number) {
    const row = await db.select().from(actividades).where(eq(actividades.id, id)).limit(1);
    return row[0] ?? null;
  }

  static async completarActividad(id: number) {
    const actual = await db.select().from(actividades).where(eq(actividades.id, id)).limit(1);
    if (!actual[0]) {
      return null;
    }

    const updated = await db
      .update(actividades)
      .set({ completada: true, updatedAt: stamp() })
      .where(eq(actividades.id, id))
      .returning();

    await db.update(clientes).set({ updatedAt: stamp() }).where(eq(clientes.id, actual[0].clienteId));
    return updated[0];
  }

  static async eliminarActividad(id: number) {
    const actual = await db.select().from(actividades).where(eq(actividades.id, id)).limit(1);
    if (!actual[0]) {
      return false;
    }

    if (actual[0].completada) {
      throw new Error('Las actividades completadas no se pueden eliminar.');
    }

    await db.delete(actividades).where(eq(actividades.id, id));
    await db.update(clientes).set({ updatedAt: stamp() }).where(eq(clientes.id, actual[0].clienteId));
    return true;
  }
}
