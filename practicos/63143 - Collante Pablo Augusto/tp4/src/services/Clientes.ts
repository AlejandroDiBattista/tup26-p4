import { asc, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { actividades, clientes } from '../db/schema.js';

export class ErrorDeNegocio extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

function idValido(value: number): number {
  if (!Number.isSafeInteger(value) || value < 1) throw new ErrorDeNegocio('ID inválido.', 400);
  return value;
}

function objeto(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ErrorDeNegocio('Los datos deben ser un objeto.', 400);
  }
  return value as Record<string, unknown>;
}

function texto(value: unknown, campo: string, maximo: number, obligatorio = false): string {
  if (typeof value !== 'string') throw new ErrorDeNegocio(`${campo} debe ser texto.`, 400);
  const limpio = value.trim();
  if (obligatorio && !limpio) throw new ErrorDeNegocio(`${campo} es obligatorio.`, 400);
  if (limpio.length > maximo) throw new ErrorDeNegocio(`${campo} supera ${maximo} caracteres.`, 400);
  return limpio;
}

function datosCliente(value: unknown) {
  const data = objeto(value);
  const nombre = texto(data.nombre, 'Nombre', 120, true);
  const email = texto(data.email ?? '', 'Email', 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ErrorDeNegocio('Email inválido.', 400);
  }
  return {
    nombre,
    email,
    telefono: texto(data.telefono ?? '', 'Teléfono', 50),
    direccion: texto(data.direccion ?? '', 'Dirección', 250),
  };
}

function datosActividad(value: unknown) {
  const data = objeto(value);
  const descripcion = texto(data.descripcion, 'Descripción', 500, true);
  const fecha = data.fecha == null || data.fecha === '' ? null : texto(data.fecha, 'Fecha', 10);
  if (fecha) {
    const fechaReal = new Date(`${fecha}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(fechaReal.getTime())
      || fechaReal.toISOString().slice(0, 10) !== fecha) {
      throw new ErrorDeNegocio('Fecha inválida.', 400);
    }
  }
  return { descripcion, fecha };
}

export class Clientes {
  static listar(busqueda = '') {
    const q = busqueda.trim().slice(0, 200);
    if (!q) return db.select().from(clientes).orderBy(asc(clientes.nombre)).all();
    const patron = `%${q}%`;
    return db.select().from(clientes).where(sql`
      CAST(${clientes.id} AS TEXT) LIKE ${patron}
      OR ${clientes.nombre} LIKE ${patron}
      OR ${clientes.email} LIKE ${patron}
      OR ${clientes.telefono} LIKE ${patron}
      OR ${clientes.direccion} LIKE ${patron}
      OR EXISTS (
        SELECT 1 FROM ${actividades}
        WHERE ${actividades.clienteId} = ${clientes.id}
          AND (${actividades.descripcion} LIKE ${patron} OR ${actividades.fecha} LIKE ${patron})
      )
    `).orderBy(asc(clientes.nombre)).all();
  }

  static obtener(id: number) {
    idValido(id);
    const cliente = db.select().from(clientes).where(eq(clientes.id, id)).get();
    if (!cliente) throw new ErrorDeNegocio('Cliente no encontrado.', 404);
    return {
      ...cliente,
      actividades: db.select().from(actividades)
        .where(eq(actividades.clienteId, id))
        .orderBy(asc(actividades.completada), asc(actividades.fecha), desc(actividades.id)).all(),
    };
  }

  static crear(data: unknown) {
    const [cliente] = db.insert(clientes).values(datosCliente(data)).returning().all();
    return Clientes.obtener(cliente.id);
  }

  static actualizar(id: number, data: unknown) {
    Clientes.obtener(id);
    db.update(clientes).set(datosCliente(data)).where(eq(clientes.id, id)).run();
    return Clientes.obtener(id);
  }

  static eliminar(id: number) {
    Clientes.obtener(id);
    db.delete(clientes).where(eq(clientes.id, id)).run();
  }

  static crearActividad(clienteId: number, data: unknown) {
    Clientes.obtener(clienteId);
    const [actividad] = db.insert(actividades)
      .values({ clienteId, ...datosActividad(data) }).returning().all();
    return actividad;
  }

  private static actividad(clienteId: number, actividadId: number) {
    idValido(clienteId);
    idValido(actividadId);
    const actividad = db.select().from(actividades).where(sql`
      ${actividades.id} = ${actividadId} AND ${actividades.clienteId} = ${clienteId}
    `).get();
    if (!actividad) throw new ErrorDeNegocio('Actividad no encontrada.', 404);
    return actividad;
  }

  static actualizarActividad(clienteId: number, actividadId: number, data: unknown) {
    const actividad = Clientes.actividad(clienteId, actividadId);
    if (actividad.completada) throw new ErrorDeNegocio('Una actividad completada no se puede editar.', 409);
    const [actualizada] = db.update(actividades).set(datosActividad(data))
      .where(eq(actividades.id, actividadId)).returning().all();
    return actualizada;
  }

  static completarActividad(clienteId: number, actividadId: number) {
    const actividad = Clientes.actividad(clienteId, actividadId);
    if (actividad.completada) return actividad;
    const [completada] = db.update(actividades)
      .set({ completada: true, completadaEn: new Date().toISOString() })
      .where(eq(actividades.id, actividadId)).returning().all();
    return completada;
  }

  static eliminarActividad(clienteId: number, actividadId: number) {
    const actividad = Clientes.actividad(clienteId, actividadId);
    if (actividad.completada) throw new ErrorDeNegocio('Una actividad completada no se puede eliminar.', 409);
    db.delete(actividades).where(eq(actividades.id, actividadId)).run();
  }
}
