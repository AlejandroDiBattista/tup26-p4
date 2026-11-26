import { eq, or, sql } from 'drizzle-orm';
import { db } from '../db';
import { actividades, clientes } from '../db/schema';
import { HttpError } from './errors';

export interface ClienteInput {
  nombre?: string;
  email?: string;
  telefono?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
}

export interface ActividadInput {
  descripcion?: string;
  fecha?: string | null;
}

export interface ClienteConActividades {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  ciudad: string | null;
  createdAt: string;
  compromisos: (typeof actividades.$inferSelect)[];
  completadas: (typeof actividades.$inferSelect)[];
}

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

/** Devuelve la fecha local de hoy en formato ISO corto (YYYY-MM-DD). */
function hoyISO(): string {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

/** Normaliza un texto opcional: recorta y devuelve null si queda vacío. */
function textoOpcional(valor: string | null | undefined): string | null {
  const limpio = valor?.trim();
  return limpio ? limpio : null;
}

/** Valida la fecha opcional de una actividad. */
function normalizarFecha(valor: string | null | undefined): string | null {
  const limpio = valor?.trim();
  if (!limpio) return null;
  if (!FORMATO_FECHA.test(limpio)) {
    throw new HttpError(400, 'La fecha debe tener el formato YYYY-MM-DD');
  }
  return limpio;
}

/**
 * Módulo de servicio con toda la lógica de negocio de clientes y actividades.
 * Todos los métodos son estáticos, tal como pide el enunciado.
 */
export class Clientes {
  /** Lista clientes, opcionalmente filtrando por cualquier campo. */
  static async listar(busqueda?: string) {
    const termino = busqueda?.trim();

    if (!termino) {
      return db.select().from(clientes).orderBy(clientes.nombre);
    }

    const patron = `%${termino.toLowerCase()}%`;

    return db
      .select()
      .from(clientes)
      .where(
        or(
          sql`lower(${clientes.nombre}) like ${patron}`,
          sql`lower(${clientes.email}) like ${patron}`,
          sql`lower(coalesce(${clientes.telefono}, '')) like ${patron}`,
          sql`lower(coalesce(${clientes.direccion}, '')) like ${patron}`,
          sql`lower(coalesce(${clientes.ciudad}, '')) like ${patron}`,
        ),
      )
      .orderBy(clientes.nombre);
  }

  /** Devuelve la ficha completa del cliente con sus actividades separadas. */
  static async obtenerPorId(id: number): Promise<ClienteConActividades> {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id));

    if (!cliente) {
      throw new HttpError(404, 'Cliente no encontrado');
    }

    const todas = await db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, id))
      .orderBy(actividades.id);

    const compromisos = todas.filter((actividad) => !actividad.completada);
    const completadas = todas
      .filter((actividad) => actividad.completada)
      .sort(
        (a, b) =>
          (b.fechaCompletada ?? '').localeCompare(a.fechaCompletada ?? '') || b.id - a.id,
      );

    return { ...cliente, compromisos, completadas };
  }

  /** Da de alta un cliente. */
  static async crear(data: ClienteInput) {
    const nombre = data.nombre?.trim();
    const email = data.email?.trim();

    if (!nombre || !email) {
      throw new HttpError(400, 'El nombre y el email son obligatorios');
    }

    const [creado] = await db
      .insert(clientes)
      .values({
        nombre,
        email,
        telefono: textoOpcional(data.telefono),
        direccion: textoOpcional(data.direccion),
        ciudad: textoOpcional(data.ciudad),
      })
      .returning();

    return creado;
  }

  /** Modifica los datos de un cliente existente. */
  static async actualizar(id: number, data: ClienteInput) {
    const actual = await Clientes.buscarCliente(id);

    const nombre = data.nombre !== undefined ? data.nombre.trim() : actual.nombre;
    const email = data.email !== undefined ? data.email.trim() : actual.email;

    if (!nombre || !email) {
      throw new HttpError(400, 'El nombre y el email son obligatorios');
    }

    const [actualizado] = await db
      .update(clientes)
      .set({
        nombre,
        email,
        telefono:
          data.telefono !== undefined
            ? textoOpcional(data.telefono)
            : actual.telefono,
        direccion:
          data.direccion !== undefined
            ? textoOpcional(data.direccion)
            : actual.direccion,
        ciudad:
          data.ciudad !== undefined ? textoOpcional(data.ciudad) : actual.ciudad,
      })
      .where(eq(clientes.id, id))
      .returning();

    return actualizado;
  }

  /** Elimina el cliente y, en cascada, todas sus actividades. */
  static async eliminar(id: number): Promise<void> {
    await Clientes.buscarCliente(id);
    await db.delete(clientes).where(eq(clientes.id, id));
  }

  /** Agrega un compromiso (actividad pendiente) a un cliente. */
  static async agregarActividad(clienteId: number, data: ActividadInput) {
    await Clientes.buscarCliente(clienteId);

    const descripcion = data.descripcion?.trim();
    if (!descripcion) {
      throw new HttpError(400, 'La descripción es obligatoria');
    }

    const [creada] = await db
      .insert(actividades)
      .values({
        clienteId,
        descripcion,
        fecha: normalizarFecha(data.fecha),
        completada: false,
      })
      .returning();

    return creada;
  }

  /** Edita descripción y fecha de una actividad no completada. */
  static async actualizarActividad(actividadId: number, data: ActividadInput) {
    const actual = await Clientes.buscarActividad(actividadId);

    if (actual.completada) {
      throw new HttpError(409, 'Una actividad completada no se puede editar');
    }

    const descripcion =
      data.descripcion !== undefined ? data.descripcion.trim() : actual.descripcion;

    if (!descripcion) {
      throw new HttpError(400, 'La descripción es obligatoria');
    }

    const [actualizada] = await db
      .update(actividades)
      .set({
        descripcion,
        fecha:
          data.fecha !== undefined ? normalizarFecha(data.fecha) : actual.fecha,
      })
      .where(eq(actividades.id, actividadId))
      .returning();

    return actualizada;
  }

  /** Marca la actividad como completada y registra la fecha actual. */
  static async completarActividad(actividadId: number) {
    const actual = await Clientes.buscarActividad(actividadId);

    if (actual.completada) {
      throw new HttpError(409, 'La actividad ya está completada');
    }

    const [completada] = await db
      .update(actividades)
      .set({ completada: true, fechaCompletada: hoyISO() })
      .where(eq(actividades.id, actividadId))
      .returning();

    return completada;
  }

  /** Vuelve a mover una actividad completada a la lista de compromisos. */
  static async reabrirActividad(actividadId: number) {
    const actual = await Clientes.buscarActividad(actividadId);

    if (!actual.completada) {
      throw new HttpError(409, 'La actividad ya está pendiente');
    }

    const [reabierta] = await db
      .update(actividades)
      .set({ completada: false, fechaCompletada: null })
      .where(eq(actividades.id, actividadId))
      .returning();

    return reabierta;
  }

  /** Elimina una actividad individual solo si no está completada. */
  static async eliminarActividad(actividadId: number): Promise<void> {
    const actual = await Clientes.buscarActividad(actividadId);

    if (actual.completada) {
      throw new HttpError(409, 'Una actividad completada no se puede eliminar');
    }

    await db.delete(actividades).where(eq(actividades.id, actividadId));
  }

  /** Lista las actividades de un cliente (opcional, usado por la API). */
  static async listarActividades(clienteId: number) {
    await Clientes.buscarCliente(clienteId);
    return db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, clienteId))
      .orderBy(actividades.id);
  }

  private static async buscarCliente(id: number) {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id));
    if (!cliente) {
      throw new HttpError(404, 'Cliente no encontrado');
    }
    return cliente;
  }

  private static async buscarActividad(id: number) {
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(eq(actividades.id, id));
    if (!actividad) {
      throw new HttpError(404, 'Actividad no encontrada');
    }
    return actividad;
  }
}
