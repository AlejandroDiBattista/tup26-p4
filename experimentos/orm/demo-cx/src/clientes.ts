import { ErrorServicio } from './errores.js';
import { and, eq, isNull } from 'drizzle-orm';
import type { Database } from './db/connection.js';
import { actividades, clientes, type Actividad, type Cliente, type NuevaActividad, type NuevoCliente } from './db/schema.js';
import { coincide, type Filtro } from './busqueda.js';
import { normalizarActividad, normalizarCliente } from './normalizar.js';

type DatosCliente = Omit<NuevoCliente, 'id'>;
type DatosActividad = Omit<NuevaActividad, 'id' | 'clienteId'>;
type Estado = 'pendiente' | 'vencida' | 'completada';

export function fechaHoy() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Argentina/Tucuman' }).format(new Date());
}

function estado(actividad: Actividad, hoy: string): Estado {
  if (actividad.fechaFinalizacion !== null) return 'completada';
  return actividad.fechaCompromiso !== null && actividad.fechaCompromiso < hoy ? 'vencida' : 'pendiente';
}

function requerido<T>(valor: T | undefined, mensaje: string): T {
  if (valor === undefined) throw new ErrorServicio(mensaje, 'no_encontrado');
  return valor;
}

function cambios<T extends object>(datos: T): T {
  if (Object.keys(datos).length === 0) throw new ErrorServicio('No hay cambios para guardar.');
  return datos;
}

export class Clientes {
  static async crear(db: Database, datos: DatosCliente) {
    const normalizado = normalizarCliente(datos);
    if (!normalizado.nombre || !normalizado.apellido || !normalizado.email) {
      throw new ErrorServicio('Nombre, apellido y email son obligatorios.');
    }
    const [cliente] = await db.insert(clientes).values({
      ...normalizado, nombre: normalizado.nombre, apellido: normalizado.apellido, email: normalizado.email,
    }).returning();
    return cliente;
  }

  static async buscar(db: Database, filtro: Filtro<Cliente> = '', hoy = fechaHoy()) {
    const registros = await db.query.clientes.findMany({
      orderBy: (tabla, { asc }) => [asc(tabla.id)],
      with: { actividades: { orderBy: (tabla, { asc }) => [asc(tabla.id)] } },
    });
    return registros.filter((cliente) => coincide(cliente, filtro)).map((cliente) => ({
      ...cliente, actividades: cliente.actividades.map((actividad) => ({ ...actividad, estado: estado(actividad, hoy) })),
    }));
  }

  static async obtener(db: Database, id: Cliente['id'], hoy = fechaHoy()) {
    const cliente = requerido(await db.query.clientes.findFirst({
      where: eq(clientes.id, id),
      with: { actividades: { orderBy: (tabla, { asc }) => [asc(tabla.id)] } },
    }), 'Cliente inexistente.');
    return { ...cliente, actividades: cliente.actividades.map((actividad) => ({ ...actividad, estado: estado(actividad, hoy) })) };
  }

  static async actualizar(db: Database, id: Cliente['id'], datos: Partial<DatosCliente>) {
    const [cliente] = await db.update(clientes).set(cambios(normalizarCliente(datos)))
      .where(eq(clientes.id, id)).returning();
    return requerido(cliente, 'Cliente inexistente.');
  }

  static async eliminar(db: Database, id: Cliente['id']) {
    const [cliente] = await db.delete(clientes).where(eq(clientes.id, id)).returning();
    return requerido(cliente, 'Cliente inexistente.');
  }

  static async crearActividad(db: Database, clienteId: Cliente['id'], datos: DatosActividad) {
    await Clientes.obtener(db, clienteId);
    const normalizado = normalizarActividad(datos);
    if (!normalizado.descripcion) throw new ErrorServicio('La descripción es obligatoria.');
    const [actividad] = await db.insert(actividades).values({
      ...normalizado, descripcion: normalizado.descripcion, clienteId,
    }).returning();
    return actividad;
  }

  static async buscarActividades(db: Database, clienteId: Cliente['id'], filtro: Filtro<Actividad & { estado: Estado }> = '', hoy = fechaHoy()) {
    const cliente = await Clientes.obtener(db, clienteId, hoy);
    return cliente.actividades.filter((actividad) => coincide(actividad, filtro));
  }

  static async obtenerActividad(db: Database, clienteId: Cliente['id'], id: Actividad['id'], hoy = fechaHoy()) {
    return requerido((await Clientes.buscarActividades(db, clienteId, { id }, hoy))[0], 'Actividad inexistente para este cliente.');
  }

  static async actualizarActividad(db: Database, clienteId: Cliente['id'], id: Actividad['id'], datos: Partial<DatosActividad>) {
    const [actividad] = await db.update(actividades).set(cambios(normalizarActividad(datos))).where(and(
      eq(actividades.clienteId, clienteId), eq(actividades.id, id), isNull(actividades.fechaFinalizacion),
    )).returning();
    if (!actividad) {
      await Clientes.obtenerActividad(db, clienteId, id);
      throw new ErrorServicio('La actividad ya está completada; no se puede editar ni borrar.', 'conflicto');
    }
    return actividad;
  }

  static completarActividad(db: Database, clienteId: Cliente['id'], id: Actividad['id'], fecha = fechaHoy()) {
    return Clientes.actualizarActividad(db, clienteId, id, { fechaFinalizacion: fecha });
  }

  static async eliminarActividad(db: Database, clienteId: Cliente['id'], id: Actividad['id']) {
    const [actividad] = await db.delete(actividades).where(and(
      eq(actividades.clienteId, clienteId), eq(actividades.id, id), isNull(actividades.fechaFinalizacion),
    )).returning();
    if (!actividad) {
      await Clientes.obtenerActividad(db, clienteId, id);
      throw new ErrorServicio('La actividad ya está completada; no se puede editar ni borrar.', 'conflicto');
    }
    return actividad;
  }
}

