import { and, asc, eq, isNull, lt } from 'drizzle-orm';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { z } from 'zod';
import { db } from './base.js';
import { actividades, clientes, type NuevoCliente, type NuevaActividad } from './esquema.js';
import { ErrorServicio } from './errores.js';
import { cambiosActividad, cambiosCliente, datosActividad, datosCliente, filtroActividad, hoyTucuman, idValido } from './validacion.js';

function normalizarNombre(valor: string) {
  return valor.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es-AR')
    .replace(/(^|[\s'-])\p{L}/gu, letra => letra.toLocaleUpperCase('es-AR'));
}

function normalizarCliente(datos: Partial<NuevoCliente>) {
  const resultado = { ...datos };
  if (resultado.nombre !== undefined) resultado.nombre = normalizarNombre(resultado.nombre);
  if (resultado.apellido !== undefined) resultado.apellido = normalizarNombre(resultado.apellido);
  if (resultado.email !== undefined) resultado.email = resultado.email.trim().toLowerCase();
  if (resultado.telefono !== undefined) {
    if (!resultado.telefono?.trim()) resultado.telefono = null;
    else {
      const telefono = parsePhoneNumberFromString(resultado.telefono, 'AR');
      if (!telefono?.isValid() || telefono.country !== 'AR') {
        throw new ErrorServicio(400, 'El teléfono debe ser argentino e incluir el código de área.');
      }
      resultado.telefono = telefono.number;
    }
  }
  return resultado;
}

function textoComparable(valor: unknown) {
  return String(valor ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export class Clientes {
  static async listar() {
    return db.select().from(clientes).orderBy(asc(clientes.apellido), asc(clientes.nombre));
  }

  static async buscar(texto: string) {
    const consulta = textoComparable(z.string().parse(texto).trim());
    return (await this.listar()).filter(cliente => Object.values(cliente).some(valor => textoComparable(valor).includes(consulta)));
  }

  static async buscarPorEmail(email: string) {
    const normalizado = datosCliente.shape.email.parse(email);
    return (await db.select().from(clientes).where(eq(clientes.email, normalizado)))[0] ?? null;
  }

  static async obtener(id: number) {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, idValido.parse(id)));
    if (!cliente) throw new ErrorServicio(404, 'Cliente no encontrado.');
    return cliente;
  }

  static async crear(datos: NuevoCliente) {
    const valores = normalizarCliente(datosCliente.parse(datos)) as NuevoCliente;
    return (await db.insert(clientes).values(valores).returning())[0];
  }

  static async actualizar(id: number, datos: Partial<NuevoCliente>) {
    await this.obtener(id);
    const valores = normalizarCliente(cambiosCliente.parse(datos));
    if (!Object.keys(valores).length) throw new ErrorServicio(400, 'Indica al menos un campo para actualizar.');
    return (await db.update(clientes).set(valores).where(eq(clientes.id, id)).returning())[0];
  }

  static async eliminar(id: number) {
    await this.obtener(id);
    // Borrado explícito para garantizar la composición también en conexiones remotas.
    await db.transaction(async tx => {
      await tx.delete(actividades).where(eq(actividades.clienteId, id));
      await tx.delete(clientes).where(eq(clientes.id, id));
    });
    return { eliminado: true };
  }

  static async listarActividades(clienteId: number, filtro: z.infer<typeof filtroActividad> = 'todas') {
    await this.obtener(clienteId);
    filtroActividad.parse(filtro);
    const pendiente = isNull(actividades.fechaFinalizacion);
    const condicion = filtro === 'pendientes' ? pendiente
      : filtro === 'vencidas' ? and(pendiente, lt(actividades.fechaCompromiso, hoyTucuman()))
      : filtro === 'sin-compromiso' ? and(pendiente, isNull(actividades.fechaCompromiso)) : undefined;
    return db.select().from(actividades).where(and(eq(actividades.clienteId, clienteId), condicion)).orderBy(asc(actividades.id));
  }

  static async obtenerActividad(clienteId: number, id: number) {
    await this.obtener(clienteId);
    const [actividad] = await db.select().from(actividades).where(and(eq(actividades.clienteId, clienteId), eq(actividades.id, idValido.parse(id))));
    if (!actividad) throw new ErrorServicio(404, 'Actividad no encontrada en este cliente.');
    return actividad;
  }

  static async crearActividad(clienteId: number, datos: NuevaActividad) {
    await this.obtener(clienteId);
    return (await db.insert(actividades).values({ ...datosActividad.parse(datos), clienteId }).returning())[0];
  }

  static async actualizarActividad(clienteId: number, id: number, datos: Partial<NuevaActividad>) {
    await this.obtenerActividad(clienteId, id);
    const valores = cambiosActividad.parse(datos);
    if (!Object.keys(valores).length) throw new ErrorServicio(400, 'Indica al menos un campo para actualizar.');
    const [actividad] = await db.update(actividades).set(valores).where(and(
      eq(actividades.id, id), eq(actividades.clienteId, clienteId), isNull(actividades.fechaFinalizacion),
    )).returning();
    if (!actividad) throw new ErrorServicio(409, 'Las actividades completadas no se pueden editar.');
    return actividad;
  }

  static async eliminarActividad(clienteId: number, id: number) {
    await this.obtenerActividad(clienteId, id);
    const eliminadas = await db.delete(actividades).where(and(
      eq(actividades.id, id), eq(actividades.clienteId, clienteId), isNull(actividades.fechaFinalizacion),
    )).returning();
    if (!eliminadas.length) throw new ErrorServicio(409, 'Las actividades completadas no se pueden borrar individualmente.');
    return { eliminado: true };
  }

  static async completarActividad(clienteId: number, id: number) {
    const anterior = await this.obtenerActividad(clienteId, id);
    if (anterior.fechaFinalizacion) return anterior;
    const [actividad] = await db.update(actividades).set({ fechaFinalizacion: new Date().toISOString() }).where(and(
      eq(actividades.id, id), eq(actividades.clienteId, clienteId), isNull(actividades.fechaFinalizacion),
    )).returning();
    return actividad ?? this.obtenerActividad(clienteId, id);
  }
}
