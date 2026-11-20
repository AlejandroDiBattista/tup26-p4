import { and, eq, isNull, like, lt, or } from 'drizzle-orm';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { db } from '../db.js';
import { actividades, clientes } from '../schema.js';

type DatosCliente = Omit<typeof clientes.$inferInsert, 'id'>;
type DatosActividad = Omit<typeof actividades.$inferInsert, 'id' | 'clienteId'>;

function formatearNombre(valor: string, campo: string) {
  if (typeof valor !== 'string' || !valor.trim()) {
    throw new Error(`${campo} es obligatorio.`);
  }

  const particulas = ['de', 'del', 'la', 'las', 'los', 'y'];
  return valor.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es-AR')
    .split(' ').map(palabra => {
      if (particulas.includes(palabra)) return palabra;
      return palabra.replace(/(^|[-'])\p{L}/gu, letra => letra.toLocaleUpperCase('es-AR'));
    }).join(' ');
}

function formatearTelefono(valor: string | null | undefined) {
  if (valor == null || valor.trim() === '') return null;

  const telefono = parsePhoneNumberFromString(valor.trim(), { defaultCountry: 'AR', extract: false });
  if (!telefono || telefono.country !== 'AR' || !telefono.isValid() || telefono.ext) {
    throw new Error('El teléfono debe ser argentino e incluir el código de área.');
  }

  return telefono.formatInternational();
}

function normalizarEmail(valor: string) {
  if (typeof valor !== 'string' || !valor.trim()) {
    throw new Error('El email es obligatorio.');
  }
  return valor.trim().toLowerCase();
}

function normalizar(datos: Partial<DatosCliente>) {
  const resultado = { ...datos };
  if ('nombre'   in datos) resultado.nombre = formatearNombre(datos.nombre!, 'El nombre');
  if ('apellido' in datos) resultado.apellido = formatearNombre(datos.apellido!, 'El apellido');
  if ('telefono' in datos) resultado.telefono = formatearTelefono(datos.telefono);
  if ('email'    in datos) resultado.email = normalizarEmail(datos.email!);
  return resultado;
}

export class Clientes {
  static async listar() {
    return db.select().from(clientes);
  }

  static async obtener(id: number) {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id));
    return cliente;
  }

  static async buscarPorEmail(email: string) {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.email, normalizarEmail(email)));
    return cliente;
  }

  static async buscar(texto: string) {
    const patron = `%${texto}%`;

    return db.select().from(clientes).where(or(
      like(clientes.id, patron),
      like(clientes.nombre, patron),
      like(clientes.apellido, patron),
      like(clientes.telefono, patron),
      like(clientes.email, patron),
    ));
  }

  static async crear(datos: DatosCliente) {
    const valores = {
      ...datos,
      nombre: formatearNombre(datos.nombre, 'El nombre'),
      apellido: formatearNombre(datos.apellido, 'El apellido'),
      telefono: formatearTelefono(datos.telefono),
      email: normalizarEmail(datos.email),
    };
    const [cliente] = await db.insert(clientes).values(valores).returning();
    return cliente;
  }

  static async actualizar(id: number, datos: Partial<DatosCliente>) {
    const [cliente] = await db.update(clientes).set(normalizar(datos))
      .where(eq(clientes.id, id)).returning();
    return cliente;
  }

  static async eliminar(id: number) {
    const eliminados = await db.delete(clientes).where(eq(clientes.id, id)).returning();
    return eliminados.length > 0;
  }

  static async listarActividades(clienteId: number) {
    return db.select().from(actividades).where(eq(actividades.clienteId, clienteId));
  }

  static async listarActividadesPendientes(clienteId: number) {
    return db.select().from(actividades).where(and(
      eq(actividades.clienteId, clienteId),
      isNull(actividades.completadaEn),
    ));
  }

  static async listarActividadesVencidas(clienteId: number) {
    const hoy = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Tucuman',
    }).format(new Date());

    return db.select().from(actividades).where(and(
      eq(actividades.clienteId, clienteId),
      isNull(actividades.completadaEn),
      lt(actividades.fechaCompromiso, hoy),
    ));
  }

  static async listarActividadesSinCompromiso(clienteId: number) {
    return db.select().from(actividades).where(and(
      eq(actividades.clienteId, clienteId),
      isNull(actividades.completadaEn),
      isNull(actividades.fechaCompromiso),
    ));
  }

  static async obtenerActividad(clienteId: number, actividadId: number) {
    const [actividad] = await db.select().from(actividades).where(and(
      eq(actividades.clienteId, clienteId),
      eq(actividades.id, actividadId),
    ));
    return actividad;
  }

  static async crearActividad(clienteId: number, datos: DatosActividad) {
    const [actividad] = await db.insert(actividades)
      .values({ ...datos, clienteId }).returning();
    return actividad;
  }

  static async actualizarActividad(clienteId: number, actividadId: number, datos: Partial<DatosActividad>) {
    const [actividad] = await db.update(actividades).set(datos).where(and(
      eq(actividades.clienteId, clienteId),
      eq(actividades.id, actividadId),
      isNull(actividades.completadaEn),
    )).returning();
    return actividad;
  }

  static async completarActividad(clienteId: number, actividadId: number) {
    return this.actualizarActividad(clienteId, actividadId, { completadaEn: new Date() });
  }

  static async eliminarActividad(clienteId: number, actividadId: number) {
    const eliminadas = await db.delete(actividades).where(and(
      eq(actividades.clienteId, clienteId),
      eq(actividades.id, actividadId),
      isNull(actividades.completadaEn),
    )).returning();
    return eliminadas.length > 0;
  }
}
