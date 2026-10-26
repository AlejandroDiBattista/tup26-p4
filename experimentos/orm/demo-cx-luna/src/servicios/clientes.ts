import { and, eq, isNull, like, or, sql } from 'drizzle-orm';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { db } from '../base.js';
import {
  actividades,
  clientes,
  type NuevaActividad,
  type NuevaCliente,
} from '../esquema.js';

function normalizarCliente(datos: Partial<NuevaCliente>) {
  const nombre = datos.nombre?.trim();
  const apellido = datos.apellido?.trim();
  const email = datos.email?.trim().toLowerCase();
  let telefono = datos.telefono?.trim() || null;
  if (telefono) {
    const numero = parsePhoneNumberFromString(telefono, 'AR');
    if (!numero?.isValid())
      throw new Error('El teléfono argentino no es válido.');
    telefono = numero.formatInternational();
  }
  if (nombre !== undefined && !nombre)
    throw new Error('El nombre es obligatorio.');
  if (apellido !== undefined && !apellido)
    throw new Error('El apellido es obligatorio.');
  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error('El email no es válido.');
  return {
    ...(nombre !== undefined && { nombre }),
    ...(apellido !== undefined && { apellido }),
    ...(email !== undefined && { email }),
    ...(datos.telefono !== undefined && { telefono }),
  };
}

function fechaLocalTucuman() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Argentina/Tucuman',
  }).format(new Date());
}

export class Clientes {
  static async buscarPorEmailOTexto(texto: string) {
    return texto.includes('@')
      ? this.buscarPorEmail(texto)
      : this.buscar(texto);
  }
  static async listar() {
    return db
      .select()
      .from(clientes)
      .orderBy(clientes.apellido, clientes.nombre);
  }
  static async buscarPorId(id: number) {
    return (await db.select().from(clientes).where(eq(clientes.id, id)))[0];
  }
  static async buscarPorEmail(email: string) {
    return (
      await db
        .select()
        .from(clientes)
        .where(eq(clientes.email, email.trim().toLowerCase()))
    )[0];
  }
  static async buscar(texto: string) {
    const patron = `%${texto.trim()}%`;
    return db
      .select()
      .from(clientes)
      .where(
        or(
          like(clientes.nombre, patron),
          like(clientes.apellido, patron),
          like(clientes.email, patron),
          like(clientes.telefono, patron),
          like(sql`${clientes.id}`, patron),
        ),
      );
  }
  static async crear(datos: NuevaCliente) {
    return (
      await db
        .insert(clientes)
        .values(normalizarCliente(datos) as NuevaCliente)
        .returning()
    )[0];
  }
  static async actualizar(id: number, datos: Partial<NuevaCliente>) {
    const cambios = normalizarCliente(datos);
    return Object.keys(cambios).length
      ? (
          await db
            .update(clientes)
            .set(cambios)
            .where(eq(clientes.id, id))
            .returning()
        )[0]
      : this.buscarPorId(id);
  }
  static async eliminar(id: number) {
    return (
      await db.delete(clientes).where(eq(clientes.id, id)).returning()
    )[0];
  }

  static async listarActividades(clienteId: number) {
    return db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, clienteId))
      .orderBy(actividades.id);
  }
  static async listarPendientes(clienteId: number) {
    return db
      .select()
      .from(actividades)
      .where(
        and(
          eq(actividades.clienteId, clienteId),
          isNull(actividades.fechaFinalizacion),
        ),
      );
  }
  static async listarVencidas(clienteId: number) {
    return (await this.listarPendientes(clienteId)).filter(
      (a) =>
        a.fechaCompromiso !== null && a.fechaCompromiso < fechaLocalTucuman(),
    );
  }
  static async listarSinCompromiso(clienteId: number) {
    return db
      .select()
      .from(actividades)
      .where(
        and(
          eq(actividades.clienteId, clienteId),
          isNull(actividades.fechaFinalizacion),
          isNull(actividades.fechaCompromiso),
        ),
      );
  }
  static async crearActividad(
    clienteId: number,
    datos: Omit<NuevaActividad, 'clienteId' | 'fechaFinalizacion'>,
  ) {
    if (!(await this.buscarPorId(clienteId)))
      throw new Error('No existe el cliente.');
    return (
      await db
        .insert(actividades)
        .values({ ...datos, clienteId })
        .returning()
    )[0];
  }
  static async actualizarActividad(
    clienteId: number,
    id: number,
    datos: Partial<
      Pick<NuevaActividad, 'descripcion' | 'fecha' | 'fechaCompromiso'>
    >,
  ) {
    const existente = await this.actividadPendiente(clienteId, id);
    if (!existente)
      throw new Error('No existe una actividad pendiente con ese id.');
    return (
      await db
        .update(actividades)
        .set(datos)
        .where(
          and(eq(actividades.id, id), eq(actividades.clienteId, clienteId)),
        )
        .returning()
    )[0];
  }
  static async eliminarActividad(clienteId: number, id: number) {
    const existente = await this.actividadPendiente(clienteId, id);
    if (!existente)
      throw new Error('No existe una actividad pendiente con ese id.');
    return (
      await db
        .delete(actividades)
        .where(
          and(eq(actividades.id, id), eq(actividades.clienteId, clienteId)),
        )
        .returning()
    )[0];
  }
  static async completarActividad(clienteId: number, id: number) {
    const existente = await this.actividadPendiente(clienteId, id);
    if (!existente)
      throw new Error('No existe una actividad pendiente con ese id.');
    return (
      await db
        .update(actividades)
        .set({ fechaFinalizacion: new Date().toISOString() })
        .where(
          and(eq(actividades.id, id), eq(actividades.clienteId, clienteId)),
        )
        .returning()
    )[0];
  }
  private static async actividadPendiente(clienteId: number, id: number) {
    return (
      await db
        .select()
        .from(actividades)
        .where(
          and(
            eq(actividades.id, id),
            eq(actividades.clienteId, clienteId),
            isNull(actividades.fechaFinalizacion),
          ),
        )
    )[0];
  }
}
