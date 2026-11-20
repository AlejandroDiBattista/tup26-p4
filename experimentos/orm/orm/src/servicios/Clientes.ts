import { and, eq, isNull, like, or } from "drizzle-orm";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { db } from "../db.js";
import {
  actividades,
  clientes,
  type ActividadNueva,
  type ClienteNuevo
} from "../esquema.js";

type CambiosCliente = Omit<Partial<ClienteNuevo>, "id">;
type NuevaActividadDeCliente = Omit<ActividadNueva, "id" | "clienteId" | "fechaFinalizacion">;
type CambiosActividad = Partial<NuevaActividadDeCliente>;

function normalizarNombre(nombre: string) {
  return nombre
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es-AR")
    .replace(/(^|[\s-])\p{L}/gu, letra => letra.toLocaleUpperCase("es-AR"));
}

function normalizarTelefono(telefono: string | null) {
  if (telefono === null || !telefono.trim()) return null;

  const numero = parsePhoneNumberFromString(telefono, "AR");
  if (!numero?.isValid()) {
    throw new Error("El teléfono no es un número argentino válido.");
  }
  return numero.number;
}

function normalizarCliente<T extends CambiosCliente>(datos: T): T {
  return {
    ...datos,
    ...(datos.nombre !== undefined && { nombre: normalizarNombre(datos.nombre) }),
    ...(datos.apellido !== undefined && { apellido: normalizarNombre(datos.apellido) }),
    ...(datos.email !== undefined && { email: datos.email.trim().toLocaleLowerCase("es-AR") }),
    ...(datos.telefono !== undefined && { telefono: normalizarTelefono(datos.telefono) })
  } as T;
}

export class Clientes {
  static listar() {
    return db.select().from(clientes).orderBy(clientes.apellido, clientes.nombre);
  }

  static async buscarPorId(id: number) {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id));
    return cliente;
  }

  static async buscarPorEmail(email: string) {
    const [cliente] = await db
      .select()
      .from(clientes)
      .where(eq(clientes.email, email));
    return cliente;
  }

  static buscar(texto: string) {
    const consulta = texto.trim();
    if (!consulta) return Promise.resolve([]);

    const patron = `%${consulta}%`;
    return db
      .select()
      .from(clientes)
      .where(
        or(
          like(clientes.nombre, patron),
          like(clientes.apellido, patron),
          like(clientes.email, patron),
          like(clientes.telefono, patron)
        )
      )
      .orderBy(clientes.apellido, clientes.nombre);
  }

  static async crear(datos: ClienteNuevo) {
    const [cliente] = await db
      .insert(clientes)
      .values(normalizarCliente(datos))
      .returning();
    return cliente;
  }

  static async actualizar(id: number, datos: CambiosCliente) {
    const [cliente] = await db
      .update(clientes)
      .set(normalizarCliente(datos))
      .where(eq(clientes.id, id))
      .returning();
    return cliente;
  }

  static async eliminar(id: number) {
    const [cliente] = await db
      .delete(clientes)
      .where(eq(clientes.id, id))
      .returning();
    return cliente;
  }

  static listarActividades(clienteId: number) {
    return db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, clienteId))
      .orderBy(actividades.id);
  }

  static async buscarActividad(clienteId: number, actividadId: number) {
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(
        and(
          eq(actividades.clienteId, clienteId),
          eq(actividades.id, actividadId)
        )
      );
    return actividad;
  }

  static async crearActividad(
    clienteId: number,
    datos: NuevaActividadDeCliente
  ) {
    const [actividad] = await db
      .insert(actividades)
      .values({ ...datos, clienteId })
      .returning();
    return actividad;
  }

  static async actualizarActividad(
    clienteId: number,
    actividadId: number,
    datos: CambiosActividad
  ) {
    const [actividad] = await db
      .update(actividades)
      .set(datos)
      .where(
        and(
          eq(actividades.clienteId, clienteId),
          eq(actividades.id, actividadId),
          isNull(actividades.fechaFinalizacion)
        )
      )
      .returning();
    return actividad;
  }

  static async completarActividad(clienteId: number, actividadId: number) {
    const [actividad] = await db
      .update(actividades)
      .set({ fechaFinalizacion: new Date().toISOString() })
      .where(
        and(
          eq(actividades.clienteId, clienteId),
          eq(actividades.id, actividadId),
          isNull(actividades.fechaFinalizacion)
        )
      )
      .returning();
    return actividad;
  }

  static async eliminarActividad(clienteId: number, actividadId: number) {
    const [actividad] = await db
      .delete(actividades)
      .where(
        and(
          eq(actividades.clienteId, clienteId),
          eq(actividades.id, actividadId),
          isNull(actividades.fechaFinalizacion)
        )
      )
      .returning();
    return actividad;
  }
}
