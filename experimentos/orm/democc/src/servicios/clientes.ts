import { and, asc, eq, isNull, like, lt, or, type SQL } from 'drizzle-orm';
import { db } from '../db/conexion';
import {
  actividades,
  clientes,
  type Actividad,
  type Cliente,
  type NuevaActividad,
  type NuevoCliente,
} from '../db/esquema';
import { hoy } from '../fechas';
import { Conflicto, DatosInvalidos, NoEncontrado } from './errores';
import {
  normalizarEmail,
  normalizarFecha,
  normalizarNombre,
  normalizarTelefono,
  normalizarTexto,
} from './normalizacion';

export type DatosCliente = Omit<NuevoCliente, 'id'>;
export type DatosActividad = Pick<NuevaActividad, 'descripcion' | 'fecha' | 'compromiso'>;

export const filtrosActividades = ['todas', 'pendientes', 'vencidas', 'sin-compromiso'] as const;
export type FiltroActividades = (typeof filtrosActividades)[number];

const ordenClientes = [asc(clientes.apellido), asc(clientes.nombre)];

export class Clientes {
  // ── Clientes ────────────────────────────────────────────────

  static async listar(): Promise<Cliente[]> {
    return db.select().from(clientes).orderBy(...ordenClientes);
  }

  static async obtener(id: number): Promise<Cliente> {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id));
    if (!cliente) throw new NoEncontrado(`No existe el cliente #${id}.`);
    return cliente;
  }

  static async buscarPorEmail(email: string): Promise<Cliente | undefined> {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.email, normalizarEmail(email)));
    return cliente;
  }

  /** Busca el texto en nombre, apellido, email o teléfono. */
  static async buscar(texto: string): Promise<Cliente[]> {
    const buscado = texto.trim();
    if (!buscado) return Clientes.listar();

    const patron = `%${buscado}%`;
    const condiciones = [
      like(clientes.nombre, patron),
      like(clientes.apellido, patron),
      like(clientes.email, patron),
      like(clientes.telefono, patron),
    ];
    // Los teléfonos se guardan sin separadores: "381 512" también debe encontrarlos.
    if (/^[\d\s()+-]+$/.test(buscado)) {
      condiciones.push(like(clientes.telefono, `%${buscado.replace(/\D/g, '')}%`));
    }

    return db.select().from(clientes).where(or(...condiciones)).orderBy(...ordenClientes);
  }

  static async crear(datos: DatosCliente): Promise<Cliente> {
    const valores = normalizarCliente(datos);
    await verificarEmailLibre(valores.email);
    const [cliente] = await db.insert(clientes).values(valores).returning();
    return cliente;
  }

  /** Actualiza solo los campos recibidos. */
  static async actualizar(id: number, datos: Partial<DatosCliente>): Promise<Cliente> {
    const actual = await Clientes.obtener(id);
    const valores = normalizarCliente({
      nombre: datos.nombre ?? actual.nombre,
      apellido: datos.apellido ?? actual.apellido,
      email: datos.email ?? actual.email,
      telefono: datos.telefono === undefined ? actual.telefono : datos.telefono,
    });
    if (valores.email !== actual.email) await verificarEmailLibre(valores.email);

    const [cliente] = await db.update(clientes).set(valores).where(eq(clientes.id, id)).returning();
    return cliente;
  }

  /** Elimina el cliente junto con todas sus actividades. */
  static async eliminar(id: number): Promise<void> {
    const eliminados = await db.delete(clientes).where(eq(clientes.id, id)).returning();
    if (!eliminados.length) throw new NoEncontrado(`No existe el cliente #${id}.`);
  }

  // ── Actividades (siempre dentro de un cliente) ─────────────

  static async listarActividades(clienteId: number, filtro: FiltroActividades = 'todas'): Promise<Actividad[]> {
    if (!filtrosActividades.includes(filtro)) {
      throw new DatosInvalidos(`El filtro debe ser uno de: ${filtrosActividades.join(', ')}.`);
    }
    await Clientes.obtener(clienteId);

    const pendiente = isNull(actividades.finalizacion);
    const condiciones: Record<FiltroActividades, SQL | undefined> = {
      todas: undefined,
      pendientes: pendiente,
      vencidas: and(pendiente, lt(actividades.compromiso, hoy())),
      'sin-compromiso': and(pendiente, isNull(actividades.compromiso)),
    };

    return db
      .select()
      .from(actividades)
      .where(and(eq(actividades.clienteId, clienteId), condiciones[filtro]))
      .orderBy(asc(actividades.id));
  }

  static async obtenerActividad(clienteId: number, actividadId: number): Promise<Actividad> {
    await Clientes.obtener(clienteId);
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(and(eq(actividades.clienteId, clienteId), eq(actividades.id, actividadId)));
    if (!actividad) throw new NoEncontrado(`El cliente #${clienteId} no tiene la actividad #${actividadId}.`);
    return actividad;
  }

  static async agregarActividad(clienteId: number, datos: DatosActividad): Promise<Actividad> {
    await Clientes.obtener(clienteId);
    const [actividad] = await db
      .insert(actividades)
      .values({ clienteId, ...normalizarActividad(datos) })
      .returning();
    return actividad;
  }

  /** Actualiza solo los campos recibidos de una actividad pendiente. */
  static async actualizarActividad(
    clienteId: number,
    actividadId: number,
    datos: Partial<DatosActividad>,
  ): Promise<Actividad> {
    const actual = await obtenerPendiente(clienteId, actividadId, 'editar');
    const valores = normalizarActividad({
      descripcion: datos.descripcion ?? actual.descripcion,
      fecha: datos.fecha === undefined ? actual.fecha : datos.fecha,
      compromiso: datos.compromiso === undefined ? actual.compromiso : datos.compromiso,
    });

    const [actividad] = await db.update(actividades).set(valores).where(eq(actividades.id, actividadId)).returning();
    return actividad;
  }

  static async eliminarActividad(clienteId: number, actividadId: number): Promise<void> {
    await obtenerPendiente(clienteId, actividadId, 'borrar');
    await db.delete(actividades).where(eq(actividades.id, actividadId));
  }

  /** Marca la actividad como completada con la fecha y hora actuales. */
  static async completarActividad(clienteId: number, actividadId: number): Promise<Actividad> {
    const actual = await Clientes.obtenerActividad(clienteId, actividadId);
    if (actual.finalizacion) throw new Conflicto(`La actividad #${actividadId} ya está completada.`);

    const [actividad] = await db
      .update(actividades)
      .set({ finalizacion: new Date() })
      .where(eq(actividades.id, actividadId))
      .returning();
    return actividad;
  }
}

function normalizarCliente(datos: DatosCliente): DatosCliente {
  return {
    nombre: normalizarNombre(datos.nombre, 'nombre'),
    apellido: normalizarNombre(datos.apellido, 'apellido'),
    email: normalizarEmail(datos.email),
    telefono: normalizarTelefono(datos.telefono),
  };
}

function normalizarActividad(datos: DatosActividad): DatosActividad {
  return {
    descripcion: normalizarTexto(datos.descripcion, 'descripción'),
    fecha: normalizarFecha(datos.fecha, 'fecha'),
    compromiso: normalizarFecha(datos.compromiso, 'compromiso'),
  };
}

async function verificarEmailLibre(email: string) {
  if (await Clientes.buscarPorEmail(email)) {
    throw new Conflicto(`Ya existe un cliente con el email ${email}.`);
  }
}

// Las actividades completadas no se pueden editar ni borrar individualmente.
async function obtenerPendiente(clienteId: number, actividadId: number, accion: string) {
  const actividad = await Clientes.obtenerActividad(clienteId, actividadId);
  if (actividad.finalizacion) {
    throw new Conflicto(`La actividad #${actividadId} está completada y no se puede ${accion}.`);
  }
  return actividad;
}
