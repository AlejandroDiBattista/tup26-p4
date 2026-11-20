import { and, asc, eq, like, or } from 'drizzle-orm';
import { db } from '../db';
import { clientes, actividades } from '../db/schema';

// Tipos inferidos de Drizzle
export type Cliente = typeof clientes.$inferSelect;
export type NuevoCliente = typeof clientes.$inferInsert;
export type Actividad = typeof actividades.$inferSelect;
export type NuevaActividad = typeof actividades.$inferInsert;

export type DatosCliente = Omit<NuevoCliente, 'id'>;
export type DatosActividad = Pick<NuevaActividad, 'descripcion' | 'fechaCompromiso'>;

export type ActividadConEstado = Actividad & { completada: boolean; vencida: boolean };
export type ClienteConActividades = Cliente & { actividades: ActividadConEstado[] };

// Error de negocio con código HTTP sugerido
export class ErrorNegocio extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

// ---------- Normalización ----------

const limpiar = (s?: string | null) => (s ?? '').trim().replace(/\s+/g, ' ');
const opcional = (s?: string | null) => limpiar(s) || null;

const normalizarNombre = (s?: string | null) =>
  limpiar(s)
    .toLocaleLowerCase('es')
    .replace(/(^|[\s'-])(\p{L})/gu, (_, sep, letra) => sep + letra.toLocaleUpperCase('es'));

const normalizarEmail = (s?: string | null) => limpiar(s).toLowerCase();

const normalizarTelefono = (s?: string | null) => (s ?? '').replace(/\D/g, '') || null;

// Fecha local YYYY-MM-DD (el formato sueco 'sv' coincide con ISO)
const hoy = () => new Date().toLocaleDateString('sv');

const esFecha = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));

// ---------- Validación ----------

function prepararCliente(datos: Partial<DatosCliente>): DatosCliente {
  const cliente = {
    nombre: normalizarNombre(datos.nombre),
    apellido: normalizarNombre(datos.apellido),
    email: normalizarEmail(datos.email),
    domicilio: opcional(datos.domicilio),
    localidad: opcional(datos.localidad) && normalizarNombre(datos.localidad),
    telefono: normalizarTelefono(datos.telefono),
  };
  if (!cliente.nombre) throw new ErrorNegocio('El nombre es obligatorio');
  if (!cliente.apellido) throw new ErrorNegocio('El apellido es obligatorio');
  if (!cliente.email) throw new ErrorNegocio('El email es obligatorio');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email)) throw new ErrorNegocio('El email no es válido');
  return cliente;
}

function prepararActividad(datos: Partial<DatosActividad>): DatosActividad {
  const descripcion = limpiar(datos.descripcion);
  const fechaCompromiso = opcional(datos.fechaCompromiso);
  if (!descripcion) throw new ErrorNegocio('La descripción es obligatoria');
  if (fechaCompromiso && !esFecha(fechaCompromiso)) {
    throw new ErrorNegocio('La fecha de compromiso debe tener formato AAAA-MM-DD');
  }
  return { descripcion, fechaCompromiso };
}

const conEstado = (a: Actividad): ActividadConEstado => {
  const completada = a.fechaFinalizacion !== null;
  const vencida = !completada && a.fechaCompromiso !== null && a.fechaCompromiso < hoy();
  return { ...a, completada, vencida };
};

const esEmailDuplicado = (e: unknown) => String((e as any)?.cause ?? e).includes('UNIQUE');

// ---------- Servicio ----------

export class Clientes {
  /** Lista clientes. Si hay búsqueda, cada palabra debe aparecer en algún campo. */
  static async listar(busqueda = ''): Promise<Cliente[]> {
    const palabras = limpiar(busqueda).split(' ').filter(Boolean);
    const campos = [
      clientes.nombre, clientes.apellido, clientes.email,
      clientes.domicilio, clientes.localidad, clientes.telefono,
    ];
    const filtro = and(...palabras.map(p => or(...campos.map(c => like(c, `%${p}%`)))));

    return db.select().from(clientes).where(filtro).orderBy(asc(clientes.apellido), asc(clientes.nombre));
  }

  /** Devuelve un cliente con sus actividades. */
  static async obtener(id: number): Promise<ClienteConActividades> {
    const cliente = await db.query.clientes.findFirst({
      where: eq(clientes.id, id),
      with: { actividades: true },
    });
    if (!cliente) throw new ErrorNegocio('Cliente no encontrado', 404);
    return { ...cliente, actividades: cliente.actividades.map(conEstado) };
  }

  static async crear(datos: Partial<DatosCliente>): Promise<Cliente> {
    try {
      const [cliente] = await db.insert(clientes).values(prepararCliente(datos)).returning();
      return cliente;
    } catch (e) {
      if (esEmailDuplicado(e)) throw new ErrorNegocio('Ya existe un cliente con ese email', 409);
      throw e;
    }
  }

  static async actualizar(id: number, datos: Partial<DatosCliente>): Promise<Cliente> {
    try {
      const [cliente] = await db.update(clientes).set(prepararCliente(datos)).where(eq(clientes.id, id)).returning();
      if (!cliente) throw new ErrorNegocio('Cliente no encontrado', 404);
      return cliente;
    } catch (e) {
      if (esEmailDuplicado(e)) throw new ErrorNegocio('Ya existe un cliente con ese email', 409);
      throw e;
    }
  }

  /** Elimina el cliente junto con todas sus actividades. */
  static async eliminar(id: number): Promise<void> {
    const borrados = await db.delete(clientes).where(eq(clientes.id, id)).returning();
    if (!borrados.length) throw new ErrorNegocio('Cliente no encontrado', 404);
  }

  // ---------- Actividades ----------

  static async listarActividades(clienteId: number): Promise<ActividadConEstado[]> {
    return (await Clientes.obtener(clienteId)).actividades;
  }

  static async crearActividad(clienteId: number, datos: Partial<DatosActividad>): Promise<ActividadConEstado> {
    await Clientes.obtener(clienteId); // verifica que exista
    const [actividad] = await db
      .insert(actividades)
      .values({ ...prepararActividad(datos), clienteId })
      .returning();
    return conEstado(actividad);
  }

  static async actualizarActividad(
    clienteId: number, id: number, datos: Partial<DatosActividad>,
  ): Promise<ActividadConEstado> {
    await Clientes.pendiente(clienteId, id);
    const [actividad] = await db
      .update(actividades)
      .set(prepararActividad(datos))
      .where(eq(actividades.id, id))
      .returning();
    return conEstado(actividad);
  }

  /** Marca la actividad como completada con la fecha de hoy. */
  static async completarActividad(clienteId: number, id: number): Promise<ActividadConEstado> {
    await Clientes.pendiente(clienteId, id);
    const [actividad] = await db
      .update(actividades)
      .set({ fechaFinalizacion: hoy() })
      .where(eq(actividades.id, id))
      .returning();
    return conEstado(actividad);
  }

  static async eliminarActividad(clienteId: number, id: number): Promise<void> {
    await Clientes.pendiente(clienteId, id);
    await db.delete(actividades).where(eq(actividades.id, id));
  }

  /** Busca una actividad del cliente y exige que esté pendiente. */
  private static async pendiente(clienteId: number, id: number): Promise<Actividad> {
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(and(eq(actividades.id, id), eq(actividades.clienteId, clienteId)));
    if (!actividad) throw new ErrorNegocio('Actividad no encontrada', 404);
    if (actividad.fechaFinalizacion) {
      throw new ErrorNegocio('Las actividades completadas no se pueden modificar', 409);
    }
    return actividad;
  }
}
