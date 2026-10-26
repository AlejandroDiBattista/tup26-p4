import {
  and,
  count,
  eq,
  gte,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import type { Db } from "../db/client.js";
import {
  actividades,
  clientes,
  type Actividad,
  type Cliente,
  type NuevaActividad,
  type NuevoCliente,
} from "../db/schema.js";
import {
  normalizarBusqueda,
  normalizarEmail,
  normalizarNombre,
  normalizarOpcional,
  normalizarTelefono,
  recortar,
} from "./normalizar.js";
import { Conflicto, NoEncontrado, ReglaDeNegocio } from "./errores.js";

/**
 * Datos de alta/edición de una actividad. La fecha de finalización solo la fija
 * `completarActividad`, y el cliente se recibe aparte: es su dueño.
 */
export type DatosActividad = Omit<NuevaActividad, "id" | "clienteId" | "fechaFinalizacion">;

export type EstadoActividad = "pendiente" | "completada" | "vencida";

/**
 * Criterios de búsqueda de actividades dentro de un cliente. Los campos
 * presentes se combinan con AND. El cliente siempre es el primer argumento.
 */
export type CriteriosActividad = Partial<{
  id: number;
  descripcion: string;
  estado: EstadoActividad;
  compromisoDesde: Date;
  compromisoHasta: Date;
  /** true = solo actividades sin fecha de compromiso. */
  sinFecha: boolean;
}>;

let conexion: Db | null = null;

/**
 * Repositorio único de clientes y actividades.
 *
 * Los clientes son el componente; las actividades están compuestas por él:
 * no existen sin un cliente, y al borrar el cliente se van con él.
 * Todo el acceso a datos pasa por acá, así que las reglas de estado
 * (completada / vencida) no se pueden saltar por otro camino.
 */
export class ClienteRepository {
  /** Configura la conexión que usan todos los métodos. */
  static configurar(db: Db): void {
    conexion = db;
  }

  // --- Clientes ------------------------------------------------------------

  static crear(datos: NuevoCliente): Cliente {
    return enConflicto(
      () => exigir(db().insert(clientes).values(normalizarCliente(datos)).returning().get(), "No se pudo crear el cliente"),
      `Ya existe un cliente con el email ${normalizarEmail(datos.email)}`,
    );
  }

  /** Alta idempotente: si el email ya existe, devuelve el cliente que estaba. */
  static asegurar(datos: NuevoCliente): { cliente: Cliente; creado: boolean } {
    const creado = db().insert(clientes).values(normalizarCliente(datos)).onConflictDoNothing().returning().get();
    if (creado) return { cliente: creado, creado: true };

    const existente = db()
      .select()
      .from(clientes)
      .where(eq(clientes.email, normalizarEmail(datos.email)))
      .get();
    if (!existente) throw new Error(`No se pudo asegurar el cliente ${datos.email}`);

    return { cliente: existente, creado: false };
  }

  /** Todos los clientes, ordenados por apellido y nombre. */
  static listar(): Cliente[] {
    return db().select().from(clientes).orderBy(clientes.apellido, clientes.nombre).all();
  }

  /** Busca el texto en cualquiera de los campos del cliente: parcial y sin distinguir mayúsculas. */
  static buscar(texto: string): Cliente[] {
    return db()
      .select()
      .from(clientes)
      .where(or(...CAMPOS_BUSQUEDA.map((campo) => contiene(campo, texto))))
      .orderBy(clientes.apellido, clientes.nombre)
      .all();
  }

  static obtener(id: number): Cliente | undefined {
    return db().select().from(clientes).where(eq(clientes.id, id)).get();
  }

  /** El cliente con su lista de actividades: la vista del componente 1:n. */
  static conActividades(id: number): (Cliente & { actividades: Actividad[] }) | undefined {
    const cliente = ClienteRepository.obtener(id);
    return cliente && { ...cliente, actividades: ClienteRepository.listarActividades(id) };
  }

  static actualizar(id: number, cambios: Partial<NuevoCliente>): Cliente | undefined {
    return enConflicto(
      () => db().update(clientes).set(normalizarCliente(cambios)).where(eq(clientes.id, id)).returning().get(),
      "Ya existe otro cliente con ese email",
    );
  }

  /**
   * Baja del cliente junto con todas sus actividades (composición), en una
   * transacción. Acá sí caen las actividades completadas.
   */
  static eliminar(id: number): boolean {
    return db().transaction((tx) => {
      tx.delete(actividades).where(eq(actividades.clienteId, id)).run();
      return tx.delete(clientes).where(eq(clientes.id, id)).run().changes > 0;
    });
  }

  static contar(): number {
    return db().select({ total: count() }).from(clientes).get()?.total ?? 0;
  }

  // --- Actividades (siempre a través de su cliente) ------------------------
  // Ninguna operación acepta una actividad suelta: todas reciben el cliente
  // como primer argumento y validan que la actividad sea suya.

  /** Alta de una actividad: siempre nace pendiente. */
  static crearActividad(clienteId: number, datos: DatosActividad): Actividad {
    exigirCliente(clienteId);

    return enConflicto(
      () =>
        exigir(
          db().insert(actividades).values(normalizarActividad({ ...datos, clienteId })).returning().get(),
          "No se pudo crear la actividad",
        ),
      `El cliente ${clienteId} ya tiene una actividad con esa descripción`,
    );
  }

  /** Alta idempotente: la clave natural es cliente + descripción. */
  static asegurarActividad(clienteId: number, datos: DatosActividad): { actividad: Actividad; creada: boolean } {
    exigirCliente(clienteId);

    const valores = normalizarActividad({ ...datos, clienteId });
    const creada = db().insert(actividades).values(valores).onConflictDoNothing().returning().get();
    if (creada) return { actividad: creada, creada: true };

    const existente = db()
      .select()
      .from(actividades)
      .where(and(eq(actividades.clienteId, clienteId), eq(actividades.descripcion, valores.descripcion)))
      .get();
    if (!existente) throw new Error(`No se pudo asegurar la actividad "${valores.descripcion}"`);

    return { actividad: existente, creada: false };
  }

  /** Actividades del cliente, ordenadas por fecha de compromiso (las sin fecha al final). */
  static listarActividades(clienteId: number, criterios: CriteriosActividad = {}, hoy = new Date()): Actividad[] {
    exigirCliente(clienteId);

    return db()
      .select()
      .from(actividades)
      .where(filtroActividades(clienteId, criterios, hoy))
      .orderBy(sql`${actividades.fechaCompromiso} is null`, actividades.fechaCompromiso, actividades.id)
      .all();
  }

  static contarActividades(clienteId: number, criterios: CriteriosActividad = {}, hoy = new Date()): number {
    exigirCliente(clienteId);

    return db()
      .select({ total: count() })
      .from(actividades)
      .where(filtroActividades(clienteId, criterios, hoy))
      .get()?.total ?? 0;
  }

  static obtenerActividad(clienteId: number, actividadId: number): Actividad | undefined {
    return db()
      .select()
      .from(actividades)
      .where(and(eq(actividades.clienteId, clienteId), eq(actividades.id, actividadId)))
      .get();
  }

  /** Las actividades completadas no se editan. */
  static actualizarActividad(clienteId: number, actividadId: number, cambios: Partial<DatosActividad>): Actividad {
    const actual = exigirActividad(clienteId, actividadId);
    if (ClienteRepository.estaCompletada(actual)) {
      throw new ReglaDeNegocio(`La actividad ${actividadId} está completada y no se puede editar`);
    }

    return exigir(
      db()
        .update(actividades)
        .set(normalizarActividad(cambios))
        .where(and(eq(actividades.clienteId, clienteId), eq(actividades.id, actividadId)))
        .returning()
        .get(),
      "No se pudo actualizar la actividad",
    );
  }

  /** Marca la actividad como completada, asignando la fecha de finalización. */
  static completarActividad(clienteId: number, actividadId: number, fecha = new Date()): Actividad {
    const actual = exigirActividad(clienteId, actividadId);
    if (ClienteRepository.estaCompletada(actual)) return actual; // ya completada: no se reescribe la fecha

    return exigir(
      db()
        .update(actividades)
        .set({ fechaFinalizacion: fecha })
        .where(and(eq(actividades.clienteId, clienteId), eq(actividades.id, actividadId)))
        .returning()
        .get(),
      "No se pudo completar la actividad",
    );
  }

  /** Baja individual: bloqueada para las completadas. */
  static eliminarActividad(clienteId: number, actividadId: number): boolean {
    const actual = exigirActividad(clienteId, actividadId);
    if (ClienteRepository.estaCompletada(actual)) {
      throw new ReglaDeNegocio(`La actividad ${actividadId} está completada y no se puede eliminar`);
    }

    return db()
      .delete(actividades)
      .where(and(eq(actividades.clienteId, clienteId), eq(actividades.id, actividadId)))
      .run().changes > 0;
  }

  // --- Reglas de estado ----------------------------------------------------

  static estaCompletada(actividad: Actividad): boolean {
    return actividad.fechaFinalizacion !== null;
  }

  /** Vencida: sigue pendiente y su fecha de compromiso es anterior a hoy. */
  static estaVencida(actividad: Actividad, hoy = new Date()): boolean {
    return (
      !ClienteRepository.estaCompletada(actividad) &&
      actividad.fechaCompromiso !== null &&
      actividad.fechaCompromiso < inicioDelDia(hoy)
    );
  }

  /** Resumen de las actividades de un cliente. */
  static resumen(clienteId: number, hoy = new Date()): {
    cliente: Cliente;
    actividades: { total: number; pendientes: number; completadas: number; vencidas: number; sinFecha: number };
  } {
    return {
      cliente: exigirCliente(clienteId),
      actividades: {
        total: ClienteRepository.contarActividades(clienteId, {}, hoy),
        pendientes: ClienteRepository.contarActividades(clienteId, { estado: "pendiente" }, hoy),
        completadas: ClienteRepository.contarActividades(clienteId, { estado: "completada" }, hoy),
        vencidas: ClienteRepository.contarActividades(clienteId, { estado: "vencida" }, hoy),
        sinFecha: ClienteRepository.contarActividades(clienteId, { sinFecha: true }, hoy),
      },
    };
  }
}

// --- Filtros ---------------------------------------------------------------

/** Campos donde busca `buscar`. */
const CAMPOS_BUSQUEDA = [
  clientes.nombre,
  clientes.apellido,
  clientes.email,
  clientes.domicilio,
  clientes.localidad,
  clientes.telefono,
];

function filtroActividades(clienteId: number, criterios: CriteriosActividad, hoy: Date): SQL | undefined {
  const condiciones: (SQL | undefined)[] = [eq(actividades.clienteId, clienteId)];

  if (criterios.id !== undefined) condiciones.push(eq(actividades.id, criterios.id));
  if (criterios.descripcion !== undefined) condiciones.push(contiene(actividades.descripcion, criterios.descripcion));
  if (criterios.compromisoDesde !== undefined) {
    condiciones.push(gte(actividades.fechaCompromiso, criterios.compromisoDesde));
  }
  if (criterios.compromisoHasta !== undefined) {
    condiciones.push(lte(actividades.fechaCompromiso, criterios.compromisoHasta));
  }
  if (criterios.sinFecha) condiciones.push(isNull(actividades.fechaCompromiso));

  // Misma regla que `estaVencida`, expresada en SQL para poder filtrar y contar.
  if (criterios.estado === "completada") condiciones.push(isNotNull(actividades.fechaFinalizacion));
  if (criterios.estado === "pendiente") condiciones.push(isNull(actividades.fechaFinalizacion));
  if (criterios.estado === "vencida") {
    condiciones.push(and(isNull(actividades.fechaFinalizacion), lt(actividades.fechaCompromiso, inicioDelDia(hoy))));
  }

  return and(...condiciones);
}

/** Búsqueda parcial, sin distinguir mayúsculas. */
function contiene(columna: AnySQLiteColumn, valor: string): SQL {
  return like(columna, `%${normalizarBusqueda(valor)}%`);
}

// --- Normalización --------------------------------------------------------

function normalizarCliente<T extends Partial<NuevoCliente>>(datos: T): T {
  const salida: Record<string, unknown> = { ...datos };

  if (salida["nombre"] !== undefined) salida["nombre"] = normalizarNombre(salida["nombre"] as string);
  if (salida["apellido"] !== undefined) salida["apellido"] = normalizarNombre(salida["apellido"] as string);
  if (salida["email"] !== undefined) salida["email"] = normalizarEmail(salida["email"] as string);
  if (salida["domicilio"] !== undefined) {
    salida["domicilio"] = normalizarOpcional(salida["domicilio"] as string | null, recortar);
  }
  if (salida["localidad"] !== undefined) {
    salida["localidad"] = normalizarOpcional(salida["localidad"] as string | null, recortar);
  }
  if (salida["telefono"] !== undefined) {
    salida["telefono"] = normalizarOpcional(salida["telefono"] as string | null, normalizarTelefono);
  }

  return salida as T;
}

function normalizarActividad<T extends Partial<DatosActividad>>(datos: T): T {
  const { descripcion, ...resto } = datos;
  return { ...resto, ...(descripcion === undefined ? {} : { descripcion: recortar(descripcion) }) } as T;
}

// --- Apoyo ----------------------------------------------------------------

function db(): Db {
  if (!conexion) throw new Error("Falta configurar la conexión: ClienteRepository.configurar(db).");
  return conexion;
}

function exigir<T>(fila: T | undefined, mensaje: string): T {
  if (fila === undefined) throw new Error(mensaje);
  return fila;
}

/**
 * Traduce la violación de un índice único de SQLite (email o cliente+descripción)
 * a un conflicto de dominio, para que la API pueda responder 409.
 */
function enConflicto<T>(operacion: () => T, mensaje: string): T {
  try {
    return operacion();
  } catch (error) {
    const codigo = (error as { code?: string }).code;
    if (codigo?.startsWith("SQLITE_CONSTRAINT")) throw new Conflicto(mensaje, { cause: error });
    throw error;
  }
}

function exigirCliente(id: number): Cliente {
  const cliente = ClienteRepository.obtener(id);
  if (!cliente) throw new NoEncontrado(`No existe el cliente ${id}`);
  return cliente;
}

function exigirActividad(clienteId: number, actividadId: number): Actividad {
  exigirCliente(clienteId);

  const actividad = ClienteRepository.obtenerActividad(clienteId, actividadId);
  if (!actividad) throw new NoEncontrado(`El cliente ${clienteId} no tiene la actividad ${actividadId}`);
  return actividad;
}

/** "Anterior a hoy" se evalúa contra el comienzo del día. */
function inicioDelDia(fecha: Date): Date {
  const copia = new Date(fecha);
  copia.setHours(0, 0, 0, 0);
  return copia;
}
