import { and, asc, eq, like, or } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { actividades, clientes, type NuevoCliente } from '../db/schema.ts';

export class ErrorNegocio extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

type DatosCliente = Omit<NuevoCliente, 'id'>;
type DatosActividad = { descripcion?: string; fecha?: string | null };

const CAMPOS = ['nombre', 'email', 'telefono', 'direccion', 'ciudad'] as const;

function limpiarCliente(datos: Partial<DatosCliente>): DatosCliente {
  const c = Object.fromEntries(CAMPOS.map(k => [k, String(datos[k] ?? '').trim()])) as DatosCliente;
  if (!c.nombre) throw new ErrorNegocio('El nombre es obligatorio');
  if (c.email && !/^\S+@\S+\.\S+$/.test(c.email)) throw new ErrorNegocio('El email no es válido');
  return c;
}

function limpiarActividad(datos: DatosActividad) {
  const descripcion = String(datos.descripcion ?? '').trim();
  if (!descripcion) throw new ErrorNegocio('La descripción es obligatoria');
  const fecha = datos.fecha ? String(datos.fecha) : null;
  if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new ErrorNegocio('La fecha debe tener formato AAAA-MM-DD');
  return { descripcion, fecha };
}

export class Clientes {
  /** Lista clientes; si hay texto, busca en cualquier campo. */
  static async listar(texto = '') {
    const q = `%${texto.trim()}%`;
    return db.select().from(clientes)
      .where(texto.trim() ? or(...CAMPOS.map(k => like(clientes[k], q))) : undefined)
      .orderBy(asc(clientes.nombre));
  }

  static async obtener(id: number) {
    const cliente = await db.query.clientes.findFirst({ where: eq(clientes.id, id) });
    if (!cliente) throw new ErrorNegocio('Cliente no encontrado', 404);
    const lista = await db.select().from(actividades)
      .where(eq(actividades.clienteId, id))
      .orderBy(asc(actividades.fecha), asc(actividades.id));
    return { ...cliente, actividades: lista };
  }

  static async crear(datos: Partial<DatosCliente>) {
    const [nuevo] = await db.insert(clientes).values(limpiarCliente(datos)).returning();
    return nuevo;
  }

  static async actualizar(id: number, datos: Partial<DatosCliente>) {
    const [editado] = await db.update(clientes).set(limpiarCliente(datos)).where(eq(clientes.id, id)).returning();
    if (!editado) throw new ErrorNegocio('Cliente no encontrado', 404);
    return editado;
  }

  static async eliminar(id: number) {
    await db.delete(actividades).where(eq(actividades.clienteId, id));
    const [borrado] = await db.delete(clientes).where(eq(clientes.id, id)).returning();
    if (!borrado) throw new ErrorNegocio('Cliente no encontrado', 404);
  }

  static async agregarActividad(clienteId: number, datos: DatosActividad) {
    await Clientes.obtener(clienteId);
    const [nueva] = await db.insert(actividades).values({ clienteId, ...limpiarActividad(datos) }).returning();
    return nueva;
  }

  private static async actividadPendiente(clienteId: number, id: number) {
    const a = await db.query.actividades.findFirst({
      where: and(eq(actividades.id, id), eq(actividades.clienteId, clienteId)),
    });
    if (!a) throw new ErrorNegocio('Actividad no encontrada', 404);
    if (a.completada) throw new ErrorNegocio('Una actividad completada no se puede modificar');
    return a;
  }

  static async editarActividad(clienteId: number, id: number, datos: DatosActividad) {
    await Clientes.actividadPendiente(clienteId, id);
    const [editada] = await db.update(actividades).set(limpiarActividad(datos)).where(eq(actividades.id, id)).returning();
    return editada;
  }

  static async completarActividad(clienteId: number, id: number) {
    await Clientes.actividadPendiente(clienteId, id);
    const hoy = new Date().toISOString().slice(0, 10);
    const [completada] = await db.update(actividades)
      .set({ completada: true, completadaEl: hoy })
      .where(eq(actividades.id, id)).returning();
    return completada;
  }

  static async eliminarActividad(clienteId: number, id: number) {
    await Clientes.actividadPendiente(clienteId, id);
    await db.delete(actividades).where(eq(actividades.id, id));
  }
}
