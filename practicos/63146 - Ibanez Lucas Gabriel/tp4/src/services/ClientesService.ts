// Reglas de negocio del MiniCRM: clientes y sus actividades.
import { and, asc, eq, isNull, ne } from "drizzle-orm";
import { db } from "../config/database.js";
import {
  actividades,
  clientes,
  type Actividad,
  type Cliente,
  type NuevaActividad,
  type NuevoCliente,
} from "../db/schema.js";
import { Conflicto, DatosInvalidos, NoEncontrado } from "./errores.js";

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

/** Datos editables de un cliente (todo menos el id). */
export type ClienteInput = Omit<NuevoCliente, "id">;

/** Datos editables de una actividad. El cliente y la finalización los maneja el servicio. */
export type ActividadInput = Pick<NuevaActividad, "descripcion" | "fechaCompromiso">;

export type ClienteConActividades = Cliente & { actividades: Actividad[] };

// ---------------------------------------------------------------------------
// Normalización y validación
// ---------------------------------------------------------------------------

/** Recorta y colapsa espacios. Vacío o ausente => null. */
function texto(valor: unknown): string | null {
  if (valor === undefined || valor === null) return null;
  const limpio = String(valor).trim().replace(/\s+/g, " ");
  return limpio === "" ? null : limpio;
}

/** "  maría   JOSÉ " => "María José" (también respeta guiones y apóstrofos). */
function nombrePropio(valor: unknown): string | null {
  return texto(valor)?.toLowerCase().replace(/(^|[\s'-])(\p{L})/gu, (_, sep, letra) => sep + letra.toUpperCase()) ?? null;
}

function email(valor: unknown): string | null {
  return texto(valor)?.toLowerCase().replace(/\s/g, "") ?? null;
}

/** Deja solo dígitos, espacios, "+", "-" y paréntesis. */
function telefono(valor: unknown): string | null {
  return texto(String(valor ?? "").replace(/[^\d\s+()-]/g, ""));
}

/** Acepta "YYYY-MM-DD" o una fecha-hora ISO completa. */
function fechaIso(valor: unknown, campo: string): string | null {
  const fecha = texto(valor);
  if (fecha === null) return null;
  if (!/^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:\d{2})?)?$/.test(fecha) || Number.isNaN(Date.parse(fecha))) {
    throw new DatosInvalidos(`${campo} debe ser una fecha ISO (AAAA-MM-DD)`);
  }
  return fecha;
}

function requerido(valor: string | null, campo: string): string {
  if (valor === null) throw new DatosInvalidos(`El campo ${campo} es obligatorio`);
  return valor;
}

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizarCliente(data: Partial<ClienteInput>): ClienteInput {
  const cliente = {
    nombre: requerido(nombrePropio(data.nombre), "nombre"),
    apellido: requerido(nombrePropio(data.apellido), "apellido"),
    email: requerido(email(data.email), "email"),
    domicilio: texto(data.domicilio),
    localidad: texto(data.localidad),
    telefono: telefono(data.telefono),
  };
  if (!EMAIL_VALIDO.test(cliente.email)) throw new DatosInvalidos("El email no es válido");
  return cliente;
}

function normalizarActividad(data: Partial<ActividadInput>): ActividadInput {
  return {
    descripcion: requerido(texto(data.descripcion), "descripción"),
    fechaCompromiso: fechaIso(data.fechaCompromiso, "La fecha de compromiso"),
  };
}

/** Texto comparable para la búsqueda: sin acentos y en minúsculas. */
function comparable(valor: string): string {
  return valor.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/** Pendientes primero (por fecha de compromiso, sin fecha al final); luego completadas, más recientes primero. */
function ordenarActividades(lista: Actividad[]): Actividad[] {
  const pendientes = lista
    .filter((a) => a.fechaFinalizacion === null)
    .sort((a, b) => (a.fechaCompromiso ?? "9999").localeCompare(b.fechaCompromiso ?? "9999"));
  const completadas = lista
    .filter((a) => a.fechaFinalizacion !== null)
    .sort((a, b) => b.fechaFinalizacion!.localeCompare(a.fechaFinalizacion!));
  return [...pendientes, ...completadas];
}

// ---------------------------------------------------------------------------
// Servicio
// ---------------------------------------------------------------------------

export class Clientes {
  // --- Clientes -------------------------------------------------------------

  /**
   * Lista los clientes ordenados por apellido y nombre.
   * Con `busqueda`, cada palabra debe aparecer en algún campo del cliente o en la descripción
   * de alguna de sus actividades. No distingue mayúsculas ni acentos.
   */
  static async obtenerTodos(busqueda?: string): Promise<Cliente[]> {
    const todos = await db.query.clientes.findMany({
      with: { actividades: { columns: { descripcion: true } } },
      orderBy: [asc(clientes.apellido), asc(clientes.nombre)],
    });

    const palabras = comparable(busqueda ?? "").split(/\s+/).filter(Boolean);
    const coincide = (c: (typeof todos)[number]) => {
      const campos = [c.nombre, c.apellido, c.email, c.domicilio, c.localidad, c.telefono,
        c.telefono?.replace(/\D/g, ""), ...c.actividades.map((a) => a.descripcion)];
      const contenido = comparable(campos.filter(Boolean).join(" "));
      return palabras.every((p) => contenido.includes(p));
    };

    return todos.filter(coincide).map(({ actividades: _, ...cliente }) => cliente);
  }

  /** Devuelve el cliente con sus actividades ordenadas. */
  static async obtenerPorId(id: number): Promise<ClienteConActividades> {
    const cliente = await db.query.clientes.findFirst({
      where: eq(clientes.id, id),
      with: { actividades: true },
    });
    if (!cliente) throw new NoEncontrado(`No existe el cliente ${id}`);
    return { ...cliente, actividades: ordenarActividades(cliente.actividades) };
  }

  static async crear(data: Partial<ClienteInput>): Promise<Cliente> {
    const cliente = normalizarCliente(data);
    await Clientes.verificarEmailLibre(cliente.email);
    const [creado] = await db.insert(clientes).values(cliente).returning();
    return creado;
  }

  /** Actualiza solo los campos recibidos; el resto conserva su valor actual. */
  static async actualizar(id: number, data: Partial<ClienteInput>): Promise<Cliente> {
    const actual = await Clientes.buscarCliente(id);
    const cliente = normalizarCliente({ ...actual, ...data });
    await Clientes.verificarEmailLibre(cliente.email, id);
    const [actualizado] = await db.update(clientes).set(cliente).where(eq(clientes.id, id)).returning();
    return actualizado;
  }

  /** Elimina el cliente junto con todas sus actividades (incluidas las completadas). */
  static async eliminar(id: number): Promise<void> {
    await Clientes.buscarCliente(id);
    // La FK ya borra en cascada; se hace explícito para no depender de PRAGMA foreign_keys.
    await db.delete(actividades).where(eq(actividades.clienteId, id));
    await db.delete(clientes).where(eq(clientes.id, id));
  }

  // --- Actividades ----------------------------------------------------------

  static async agregarActividad(clienteId: number, data: Partial<ActividadInput>): Promise<Actividad> {
    await Clientes.buscarCliente(clienteId);
    const actividad = normalizarActividad(data);
    const [creada] = await db.insert(actividades).values({ ...actividad, clienteId }).returning();
    return creada;
  }

  /** Solo se pueden editar actividades pendientes. */
  static async actualizarActividad(actividadId: number, data: Partial<ActividadInput>): Promise<Actividad> {
    const actual = await Clientes.buscarActividadPendiente(actividadId, "editar");
    const actividad = normalizarActividad({ ...actual, ...data });
    const [actualizada] = await db
      .update(actividades)
      .set(actividad)
      .where(and(eq(actividades.id, actividadId), isNull(actividades.fechaFinalizacion)))
      .returning();
    return actualizada;
  }

  /** Solo se pueden borrar actividades pendientes. */
  static async eliminarActividad(actividadId: number): Promise<void> {
    await Clientes.buscarActividadPendiente(actividadId, "eliminar");
    await db
      .delete(actividades)
      .where(and(eq(actividades.id, actividadId), isNull(actividades.fechaFinalizacion)));
  }

  /** Marca la actividad como completada con la fecha y hora actual. */
  static async completarActividad(actividadId: number): Promise<Actividad> {
    await Clientes.buscarActividadPendiente(actividadId, "completar");
    const [completada] = await db
      .update(actividades)
      .set({ fechaFinalizacion: new Date().toISOString() })
      .where(and(eq(actividades.id, actividadId), isNull(actividades.fechaFinalizacion)))
      .returning();
    return completada;
  }

  // --- Auxiliares -----------------------------------------------------------

  private static async buscarCliente(id: number): Promise<Cliente> {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id));
    if (!cliente) throw new NoEncontrado(`No existe el cliente ${id}`);
    return cliente;
  }

  private static async buscarActividadPendiente(id: number, accion: string): Promise<Actividad> {
    const [actividad] = await db.select().from(actividades).where(eq(actividades.id, id));
    if (!actividad) throw new NoEncontrado(`No existe la actividad ${id}`);
    if (actividad.fechaFinalizacion !== null) {
      throw new Conflicto(`No se puede ${accion} una actividad completada`);
    }
    return actividad;
  }

  private static async verificarEmailLibre(valor: string, excepto?: number): Promise<void> {
    const condicion = excepto === undefined
      ? eq(clientes.email, valor)
      : and(eq(clientes.email, valor), ne(clientes.id, excepto));
    const [existente] = await db.select({ id: clientes.id }).from(clientes).where(condicion);
    if (existente) throw new Conflicto(`Ya existe un cliente con el email ${valor}`);
  }
}
