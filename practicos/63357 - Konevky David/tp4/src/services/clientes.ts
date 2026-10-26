import { and, asc, eq, like, or } from 'drizzle-orm';
import { db } from '../db/index.js';
import { clientes, actividades } from '../db/schema.js';

export type Cliente = typeof clientes.$inferSelect;
export type NuevoCliente = typeof clientes.$inferInsert;
export type Actividad = typeof actividades.$inferSelect;
export type NuevaActividad = typeof actividades.$inferInsert;
export type Estado = 'completada' | 'vencida' | 'pendiente';
export type ActividadConEstado = Actividad & { estado: Estado };
export type ClienteConActividades = Cliente & { actividades: ActividadConEstado[] };

export class ErrorServicio extends Error {
  constructor(public codigo: 'invalido' | 'no_encontrado' | 'conflicto', mensaje: string) {
    super(mensaje);
  }
}

const hoy = () => new Date().toLocaleDateString('sv'); // YYYY-MM-DD, hora local

// Completada = tiene fecha de finalización. Vencida = pendiente con compromiso anterior a hoy.
const estadoDe = (a: Actividad): Estado =>
  a.fechaFinalizacion ? 'completada' : a.fechaCompromiso && a.fechaCompromiso < hoy() ? 'vencida' : 'pendiente';

const conEstado = (a: Actividad): ActividadConEstado => ({ ...a, estado: estadoDe(a) });

// --- Normalización ---
const limpiar = (v?: string | null) => v?.trim().replace(/\s+/g, ' ') || null;

const nombrePropio = (v?: string | null) =>
  limpiar(v)?.toLowerCase().replace(/(^|[\s'-])\p{L}/gu, (m) => m.toUpperCase()) ?? null;

const email = (v?: string | null) => limpiar(v)?.toLowerCase() ?? null;

const telefono = (v?: string | null) => {
  const t = limpiar(v)?.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  return t || null;
};

function normalizarCliente(d: Partial<NuevoCliente>): Partial<NuevoCliente> {
  const r: Partial<NuevoCliente> = {};
  if ('nombre' in d) r.nombre = nombrePropio(d.nombre)!;
  if ('apellido' in d) r.apellido = nombrePropio(d.apellido)!;
  if ('email' in d) r.email = email(d.email)!;
  if ('domicilio' in d) r.domicilio = limpiar(d.domicilio);
  if ('localidad' in d) r.localidad = nombrePropio(d.localidad);
  if ('telefono' in d) r.telefono = telefono(d.telefono);
  return r;
}

function validarCliente(d: Partial<NuevoCliente>, completo: boolean) {
  for (const campo of ['nombre', 'apellido', 'email'] as const) {
    if ((completo || campo in d) && !d[campo]) throw new ErrorServicio('invalido', `${campo} es obligatorio`);
  }
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) throw new ErrorServicio('invalido', 'email inválido');
}

const fechaValida = (f?: string | null) => {
  if (f && !/^\d{4}-\d{2}-\d{2}$/.test(f)) throw new ErrorServicio('invalido', 'fecha inválida (YYYY-MM-DD)');
  return f || null;
};

const camposTexto = [
  clientes.nombre, clientes.apellido, clientes.email,
  clientes.domicilio, clientes.localidad, clientes.telefono,
];

export class Clientes {
  // --- Clientes ---

  /** Texto: busca en cualquier campo. Objeto: todos los campos indicados deben coincidir (parcial). */
  static async buscar(criterio?: string | Partial<Cliente>): Promise<Cliente[]> {
    let filtro;
    if (typeof criterio === 'string') {
      const q = criterio.trim();
      if (q) filtro = or(like(clientes.id, `%${q}%`), ...camposTexto.map((c) => like(c, `%${q}%`)));
    } else if (criterio) {
      const cond = camposTexto
        .filter((c) => criterio[c.name as keyof Cliente] != null && criterio[c.name as keyof Cliente] !== '')
        .map((c) => like(c, `%${criterio[c.name as keyof Cliente]}%`));
      if (cond.length) filtro = and(...cond);
    }
    return db.select().from(clientes).where(filtro).orderBy(asc(clientes.apellido), asc(clientes.nombre));
  }

  static async obtener(id: number): Promise<ClienteConActividades> {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id));
    if (!cliente) throw new ErrorServicio('no_encontrado', 'Cliente no encontrado');
    const acts = await db.select().from(actividades).where(eq(actividades.clienteId, id)).orderBy(asc(actividades.id));
    return { ...cliente, actividades: acts.map(conEstado) };
  }

  static async crear(datos: NuevoCliente): Promise<Cliente> {
    const d = normalizarCliente(datos) as NuevoCliente;
    validarCliente(d, true);
    await Clientes.emailLibre(d.email);
    const [creado] = await db.insert(clientes).values(d).returning();
    return creado;
  }

  static async actualizar(id: number, datos: Partial<NuevoCliente>): Promise<Cliente> {
    const { id: _id, ...resto } = datos;
    const d = normalizarCliente(resto);
    validarCliente(d, false);
    if (d.email) await Clientes.emailLibre(d.email, id);
    const [editado] = await db.update(clientes).set(d).where(eq(clientes.id, id)).returning();
    if (!editado) throw new ErrorServicio('no_encontrado', 'Cliente no encontrado');
    return editado;
  }

  /** Elimina el cliente y, en cascada, sus actividades. */
  static async eliminar(id: number): Promise<void> {
    const borrados = await db.delete(clientes).where(eq(clientes.id, id)).returning({ id: clientes.id });
    if (!borrados.length) throw new ErrorServicio('no_encontrado', 'Cliente no encontrado');
  }

  // --- Actividades ---

  static async listarActividades(clienteId: number): Promise<ActividadConEstado[]> {
    return (await Clientes.obtener(clienteId)).actividades;
  }

  static async agregarActividad(
    clienteId: number,
    datos: Pick<NuevaActividad, 'descripcion' | 'fechaCompromiso'>,
  ): Promise<ActividadConEstado> {
    await Clientes.obtener(clienteId);
    const descripcion = limpiar(datos.descripcion);
    if (!descripcion) throw new ErrorServicio('invalido', 'descripcion es obligatoria');
    const [creada] = await db.insert(actividades)
      .values({ clienteId, descripcion, fechaCompromiso: fechaValida(datos.fechaCompromiso) }).returning();
    return conEstado(creada);
  }

  /** Solo actividades no completadas. */
  static async actualizarActividad(
    clienteId: number,
    id: number,
    datos: Partial<Pick<NuevaActividad, 'descripcion' | 'fechaCompromiso'>>,
  ): Promise<ActividadConEstado> {
    const actual = await Clientes.actividadEditable(clienteId, id);
    const cambios: Partial<NuevaActividad> = {};
    if ('descripcion' in datos) {
      cambios.descripcion = limpiar(datos.descripcion)!;
      if (!cambios.descripcion) throw new ErrorServicio('invalido', 'descripcion es obligatoria');
    }
    if ('fechaCompromiso' in datos) cambios.fechaCompromiso = fechaValida(datos.fechaCompromiso);
    if (!Object.keys(cambios).length) return conEstado(actual);
    const [editada] = await db.update(actividades).set(cambios).where(eq(actividades.id, id)).returning();
    return conEstado(editada);
  }

  /** Completa la actividad con la fecha de ejecución (por defecto hoy). */
  static async completarActividad(clienteId: number, id: number, fecha: string = hoy()): Promise<ActividadConEstado> {
    await Clientes.actividadEditable(clienteId, id);
    const [completa] = await db.update(actividades)
      .set({ fechaFinalizacion: fechaValida(fecha) }).where(eq(actividades.id, id)).returning();
    return conEstado(completa);
  }

  /** Solo actividades no completadas. */
  static async eliminarActividad(clienteId: number, id: number): Promise<void> {
    await Clientes.actividadEditable(clienteId, id);
    await db.delete(actividades).where(eq(actividades.id, id));
  }

  // --- Auxiliares ---

  private static async actividadEditable(clienteId: number, id: number): Promise<Actividad> {
    const [a] = await db.select().from(actividades)
      .where(and(eq(actividades.id, id), eq(actividades.clienteId, clienteId)));
    if (!a) throw new ErrorServicio('no_encontrado', 'Actividad no encontrada');
    if (a.fechaFinalizacion) throw new ErrorServicio('conflicto', 'Una actividad completada no se puede modificar');
    return a;
  }

  private static async emailLibre(valor: string, excepto?: number) {
    const [otro] = await db.select({ id: clientes.id }).from(clientes).where(eq(clientes.email, valor));
    if (otro && otro.id !== excepto) throw new ErrorServicio('conflicto', 'Ya existe un cliente con ese email');
  }
}
