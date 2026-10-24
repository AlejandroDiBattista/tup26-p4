import { and, asc, desc, eq, or, sql, type SQL } from 'drizzle-orm';
import { db } from '../db';
import { actividades, clientes, type Actividad, type Cliente } from '../db/schema';
import { conflicto, invalido, noEncontrado } from '../utils/errores';

export const CAMPOS = ['nombre', 'apellido', 'email', 'telefono', 'direccion', 'ciudad'] as const;
export type Campo = (typeof CAMPOS)[number];

export type DatosCliente = Pick<Cliente, Campo>;
export type DatosActividad = { descripcion: string; fecha: string | null };
export type ClienteConActividades = Cliente & { compromisos: Actividad[]; completadas: Actividad[] };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

const hoy = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD en hora local
const normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const comoTexto = (valor: unknown) => (typeof valor === 'string' ? valor.trim() : '');

/** Reglas de negocio del MiniCRM: clientes y sus actividades. */
export class Clientes {
  // ---------- Clientes ----------

  /**
   * Búsqueda flexible: el texto se busca en cualquier campo del cliente
   * (o solo en `campo` si se indica), sin distinguir mayúsculas ni acentos.
   */
  static buscar(texto = '', campo?: string): Cliente[] {
    if (campo && !CAMPOS.includes(campo as Campo)) {
      throw invalido(`Campo de búsqueda inválido. Use uno de: ${CAMPOS.join(', ')}`);
    }

    const filtro = normalizar(texto.trim());
    const columnas = campo ? [campo as Campo] : CAMPOS;

    let condicion: SQL | undefined;
    if (filtro) {
      const patron = `%${filtro}%`;
      condicion = or(...columnas.map((c) => sql`normalizar(${clientes[c]}) LIKE ${patron}`));
    }

    return db.select().from(clientes).where(condicion).orderBy(asc(clientes.nombre), asc(clientes.apellido)).all();
  }

  static listar(): Cliente[] {
    return Clientes.buscar();
  }

  /** Devuelve el cliente con sus actividades separadas en compromisos y completadas. */
  static obtener(id: number): ClienteConActividades {
    const cliente = db.select().from(clientes).where(eq(clientes.id, id)).get();
    if (!cliente) throw noEncontrado('Cliente');

    const compromisos = db
      .select()
      .from(actividades)
      .where(and(eq(actividades.clienteId, id), eq(actividades.completada, false)))
      .orderBy(sql`${actividades.fecha} IS NOT NULL`, asc(actividades.fecha), asc(actividades.id))
      .all();

    const completadas = db
      .select()
      .from(actividades)
      .where(and(eq(actividades.clienteId, id), eq(actividades.completada, true)))
      .orderBy(desc(actividades.completadaEl), desc(actividades.id))
      .all();

    return { ...cliente, compromisos, completadas };
  }

  static crear(datos: unknown): Cliente {
    const valores = Clientes.validarCliente(datos);
    Clientes.verificarEmailLibre(valores.email);
    return db.insert(clientes).values(valores).returning().get();
  }

  static actualizar(id: number, datos: unknown): Cliente {
    Clientes.existe(id);
    const valores = Clientes.validarCliente(datos);
    Clientes.verificarEmailLibre(valores.email, id);
    return db.update(clientes).set(valores).where(eq(clientes.id, id)).returning().get();
  }

  /** Elimina el cliente y, en cascada, todas sus actividades. */
  static eliminar(id: number): void {
    Clientes.existe(id);
    db.delete(clientes).where(eq(clientes.id, id)).run();
  }

  // ---------- Actividades ----------

  static agregarActividad(clienteId: number, datos: unknown): Actividad {
    Clientes.existe(clienteId);
    const valores = Clientes.validarActividad(datos);
    return db.insert(actividades).values({ ...valores, clienteId }).returning().get();
  }

  static editarActividad(id: number, datos: unknown): Actividad {
    Clientes.actividadPendiente(id, 'editar');
    const valores = Clientes.validarActividad(datos);
    return db.update(actividades).set(valores).where(eq(actividades.id, id)).returning().get();
  }

  static completarActividad(id: number): Actividad {
    Clientes.actividadPendiente(id, 'completar');
    return db
      .update(actividades)
      .set({ completada: true, completadaEl: hoy() })
      .where(eq(actividades.id, id))
      .returning()
      .get();
  }

  static eliminarActividad(id: number): void {
    Clientes.actividadPendiente(id, 'eliminar');
    db.delete(actividades).where(eq(actividades.id, id)).run();
  }

  // ---------- Reglas internas ----------

  private static existe(id: number) {
    const cliente = db.select({ id: clientes.id }).from(clientes).where(eq(clientes.id, id)).get();
    if (!cliente) throw noEncontrado('Cliente');
  }

  /** Las actividades completadas no se pueden editar, completar de nuevo ni borrar. */
  private static actividadPendiente(id: number, accion: string): Actividad {
    const actividad = db.select().from(actividades).where(eq(actividades.id, id)).get();
    if (!actividad) throw noEncontrado('Actividad');
    if (actividad.completada) throw conflicto(`No se puede ${accion} una actividad completada`);
    return actividad;
  }

  private static verificarEmailLibre(email: string, excepto?: number) {
    const otro = db.select({ id: clientes.id }).from(clientes).where(eq(clientes.email, email)).get();
    if (otro && otro.id !== excepto) throw conflicto('Ya existe un cliente con ese email');
  }

  private static validarCliente(datos: unknown): DatosCliente {
    const d = (datos ?? {}) as Record<string, unknown>;
    const valores = Object.fromEntries(CAMPOS.map((c) => [c, comoTexto(d[c])])) as DatosCliente;
    valores.email = valores.email.toLowerCase();

    if (!valores.nombre) throw invalido('El nombre es obligatorio');
    if (!valores.apellido) throw invalido('El apellido es obligatorio');
    if (!EMAIL.test(valores.email)) throw invalido('El email no es válido');
    return valores;
  }

  private static validarActividad(datos: unknown): DatosActividad {
    const d = (datos ?? {}) as Record<string, unknown>;
    const descripcion = comoTexto(d.descripcion);
    const fecha = comoTexto(d.fecha) || null;

    if (!descripcion) throw invalido('La descripción de la actividad es obligatoria');
    if (fecha && (!FECHA.test(fecha) || isNaN(Date.parse(fecha)))) {
      throw invalido('La fecha debe tener formato AAAA-MM-DD');
    }
    return { descripcion, fecha };
  }
}
