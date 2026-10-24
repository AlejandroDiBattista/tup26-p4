import { and, asc, eq, isNull, ne } from "drizzle-orm";
import { db as dbCompartida, type Db } from "../db/client.js";
import { actividades, clientes, type Actividad, type Cliente } from "../db/schema.js";
import { ErrorConflicto, ErrorNoEncontrado, ErrorReglaNegocio, esViolacionUnica } from "./errores.js";
import { hoy, type FechaISO } from "./fechas.js";
import {
  normalizarCambiosActividad,
  normalizarCambiosCliente,
  normalizarFechaFinalizacion,
  normalizarId,
  normalizarNuevaActividad,
  normalizarNuevoCliente,
  type CambiosActividad,
  type CambiosCliente,
  type DatosActividad,
  type DatosCliente,
} from "./normalizar.js";

export type { CambiosActividad, CambiosCliente, DatosActividad, DatosCliente } from "./normalizar.js";

export type EstadoActividad = "pendiente" | "vencida" | "completada";

export type ActividadConEstado = Actividad & {
  estado: EstadoActividad;
  completada: boolean;
  vencida: boolean;
};

export type ClienteConActividades = Cliente & { actividades: ActividadConEstado[] };

// ── Reglas de estado de las actividades ───────────────────────────────────────

/**
 * Completada: tiene fecha de finalización.
 * Vencida: no está completada y su fecha de compromiso es anterior a hoy.
 * Pendiente: el resto (incluye las que no tienen fecha de compromiso).
 */
export function describirActividad(actividad: Actividad, fechaHoy: FechaISO = hoy()): ActividadConEstado {
  const completada = actividad.fechaFinalizacion !== null;
  const vencida = !completada && actividad.fechaCompromiso !== null && actividad.fechaCompromiso < fechaHoy;
  const estado: EstadoActividad = completada ? "completada" : vencida ? "vencida" : "pendiente";
  return { ...actividad, estado, completada, vencida };
}

/** Pendientes primero por compromiso (las sin fecha al final); luego completadas, la más reciente primero. */
function compararActividades(a: ActividadConEstado, b: ActividadConEstado): number {
  if (a.completada !== b.completada) return a.completada ? 1 : -1;
  if (a.completada) return compararTexto(b.fechaFinalizacion, a.fechaFinalizacion) || b.id - a.id;
  return compararTexto(a.fechaCompromiso, b.fechaCompromiso) || a.id - b.id;
}

/** Orden ascendente con los null al final. */
function compararTexto(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a < b ? -1 : 1;
}

function describirYOrdenar(lista: Actividad[]): ActividadConEstado[] {
  const fechaHoy = hoy();
  return lista.map((a) => describirActividad(a, fechaHoy)).sort(compararActividades);
}

// ── Búsqueda ──────────────────────────────────────────────────────────────────

const CAMPOS_BUSCABLES = [
  "nombre",
  "apellido",
  "email",
  "domicilio",
  "localidad",
  "telefono",
] as const satisfies readonly (keyof Cliente)[];

type CampoBuscable = (typeof CAMPOS_BUSCABLES)[number];
type Termino = { campo?: CampoBuscable; valor: string };

/** Minúsculas y sin acentos: "José" y "jose" coinciden. */
function plegar(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function esCampoBuscable(campo: string): campo is CampoBuscable {
  return (CAMPOS_BUSCABLES as readonly string[]).includes(campo);
}

/**
 * Cada palabra debe coincidir con algún campo ("ana tucuman").
 * Con la forma campo:valor se restringe a ese campo ("localidad:salta").
 */
function interpretarBusqueda(busqueda: string): Termino[] {
  return busqueda
    .split(/\s+/)
    .filter(Boolean)
    .map((palabra): Termino => {
      const separador = palabra.indexOf(":");
      const campo = separador > 0 ? palabra.slice(0, separador).toLowerCase() : "";
      return esCampoBuscable(campo)
        ? { campo, valor: plegar(palabra.slice(separador + 1)) }
        : { valor: plegar(palabra) };
    })
    .filter((t) => t.valor !== "");
}

function textoBuscable(cliente: Cliente, campo: CampoBuscable): string {
  const valor = cliente[campo] ?? "";
  // El teléfono también se compara sin separadores: "3815550101" encuentra "381-555-0101".
  return plegar(campo === "telefono" ? `${valor} ${valor.replace(/\D/g, "")}` : valor);
}

function coincide(cliente: Cliente, terminos: Termino[]): boolean {
  return terminos.every(({ campo, valor }) =>
    (campo ? [campo] : CAMPOS_BUSCABLES).some((c) => textoBuscable(cliente, c).includes(valor)),
  );
}

// ── Condiciones de actividad ──────────────────────────────────────────────────

type ReferenciaActividad = { clienteId: number; id: number };

function condicionActividad({ clienteId, id }: ReferenciaActividad) {
  return and(eq(actividades.id, id), eq(actividades.clienteId, clienteId));
}

/** Las escrituras sobre actividades solo afectan a las pendientes (regla de negocio en la propia consulta). */
function condicionPendiente(ref: ReferenciaActividad) {
  return and(condicionActividad(ref), isNull(actividades.fechaFinalizacion));
}

// ── Servicio ──────────────────────────────────────────────────────────────────

/**
 * Reglas de negocio del MiniCRM. Todos los métodos son estáticos y se refieren a `Clientes`
 * (no a `this`), así pueden pasarse como callbacks sin perder el contexto.
 */
export class Clientes {
  private static db: Db = dbCompartida;

  /** Permite usar otra conexión (por ejemplo, una base en memoria para pruebas). */
  static usarBaseDeDatos(db: Db): void {
    Clientes.db = db;
  }

  // ── Clientes ──

  /**
   * Lista los clientes ordenados por apellido y nombre, filtrando por cualquier campo.
   * La búsqueda no distingue mayúsculas ni acentos. Se filtra en memoria porque SQLite
   * no compara acentos sin extensiones; para el volumen de un MiniCRM es suficiente.
   */
  static async listar(busqueda = ""): Promise<Cliente[]> {
    const lista = await Clientes.db
      .select()
      .from(clientes)
      .orderBy(asc(clientes.apellido), asc(clientes.nombre), asc(clientes.id));
    const terminos = interpretarBusqueda(busqueda);
    return terminos.length ? lista.filter((c) => coincide(c, terminos)) : lista;
  }

  static async obtener(id: number | string): Promise<ClienteConActividades> {
    const cliente = await Clientes.db.query.clientes.findFirst({
      where: eq(clientes.id, normalizarId(id)),
      with: { actividades: true },
    });
    if (!cliente) throw new ErrorNoEncontrado("Cliente no encontrado");
    return { ...cliente, actividades: describirYOrdenar(cliente.actividades) };
  }

  static async crear(datos: DatosCliente): Promise<Cliente> {
    const nuevo = normalizarNuevoCliente(datos);
    await Clientes.exigirEmailDisponible(nuevo.email);
    const [cliente] = await Clientes.traducirEmailDuplicado(
      Clientes.db.insert(clientes).values(nuevo).returning(),
      nuevo.email,
    );
    return cliente!;
  }

  static async actualizar(id: number | string, cambios: CambiosCliente): Promise<Cliente> {
    const clienteId = normalizarId(id);
    const datos = normalizarCambiosCliente(cambios);
    if (Object.keys(datos).length === 0) return Clientes.exigirCliente(clienteId);
    if (datos.email) await Clientes.exigirEmailDisponible(datos.email, clienteId);

    const [cliente] = await Clientes.traducirEmailDuplicado(
      Clientes.db.update(clientes).set(datos).where(eq(clientes.id, clienteId)).returning(),
      datos.email,
    );
    if (!cliente) throw new ErrorNoEncontrado("Cliente no encontrado");
    return cliente;
  }

  /** Elimina el cliente junto con todas sus actividades, incluidas las completadas. */
  static async eliminar(id: number | string): Promise<void> {
    const clienteId = normalizarId(id);
    // Se borran explícitamente para no depender de que la conexión tenga activas las FK.
    const eliminados = await Clientes.db.transaction(async (tx) => {
      await tx.delete(actividades).where(eq(actividades.clienteId, clienteId));
      return tx.delete(clientes).where(eq(clientes.id, clienteId)).returning({ id: clientes.id });
    });
    if (eliminados.length === 0) throw new ErrorNoEncontrado("Cliente no encontrado");
  }

  // ── Actividades ──

  static async listarActividades(clienteId: number | string): Promise<ActividadConEstado[]> {
    const id = normalizarId(clienteId, "clienteId");
    await Clientes.exigirCliente(id);
    const lista = await Clientes.db.select().from(actividades).where(eq(actividades.clienteId, id));
    return describirYOrdenar(lista);
  }

  static async agregarActividad(clienteId: number | string, datos: DatosActividad): Promise<ActividadConEstado> {
    const id = normalizarId(clienteId, "clienteId");
    const nueva = normalizarNuevaActividad(datos);
    await Clientes.exigirCliente(id);
    const [actividad] = await Clientes.traducirDescripcionDuplicada(
      Clientes.db.insert(actividades).values({ ...nueva, clienteId: id }).returning(),
    );
    return describirActividad(actividad!);
  }

  // Las operaciones sobre una actividad reciben también su cliente: una actividad de otro
  // cliente se trata como inexistente.

  static async obtenerActividad(clienteId: number | string, id: number | string): Promise<ActividadConEstado> {
    const ref = Clientes.referenciaActividad(clienteId, id);
    return describirActividad(await Clientes.exigirActividad(ref));
  }

  /** Solo se editan las actividades pendientes. La finalización se registra con completarActividad. */
  static async actualizarActividad(
    clienteId: number | string,
    id: number | string,
    cambios: CambiosActividad,
  ): Promise<ActividadConEstado> {
    const ref = Clientes.referenciaActividad(clienteId, id);
    const datos = normalizarCambiosActividad(cambios);
    const actual = await Clientes.exigirActividadPendiente(ref, "editar");
    if (Object.keys(datos).length === 0) return describirActividad(actual);

    // La condición de pendiente evita editar una actividad que se completó entre la lectura y la escritura.
    const [actividad] = await Clientes.traducirDescripcionDuplicada(
      Clientes.db.update(actividades).set(datos).where(condicionPendiente(ref)).returning(),
    );
    if (!actividad) return Clientes.fallarActividadNoPendiente(ref, "editar");
    return describirActividad(actividad);
  }

  /** Marca la actividad como completada en la fecha indicada (hoy por defecto). */
  static async completarActividad(
    clienteId: number | string,
    id: number | string,
    fechaFinalizacion?: FechaISO | null,
  ): Promise<ActividadConEstado> {
    const ref = Clientes.referenciaActividad(clienteId, id);
    const fecha = normalizarFechaFinalizacion(fechaFinalizacion) ?? hoy();
    const [actividad] = await Clientes.db
      .update(actividades)
      .set({ fechaFinalizacion: fecha })
      .where(condicionPendiente(ref))
      .returning();
    if (!actividad) return Clientes.fallarActividadNoPendiente(ref, "completar");
    return describirActividad(actividad);
  }

  /** Las completadas no se borran individualmente: solo desaparecen al eliminar su cliente. */
  static async eliminarActividad(clienteId: number | string, id: number | string): Promise<void> {
    const ref = Clientes.referenciaActividad(clienteId, id);
    const eliminadas = await Clientes.db
      .delete(actividades)
      .where(condicionPendiente(ref))
      .returning({ id: actividades.id });
    if (eliminadas.length === 0) await Clientes.fallarActividadNoPendiente(ref, "eliminar");
  }

  // ── Auxiliares ──

  private static async exigirCliente(id: number): Promise<Cliente> {
    const [cliente] = await Clientes.db.select().from(clientes).where(eq(clientes.id, id));
    if (!cliente) throw new ErrorNoEncontrado("Cliente no encontrado");
    return cliente;
  }

  private static async exigirEmailDisponible(email: string, exceptoId?: number): Promise<void> {
    const condicion = exceptoId === undefined
      ? eq(clientes.email, email)
      : and(eq(clientes.email, email), ne(clientes.id, exceptoId));
    const [existente] = await Clientes.db.select({ id: clientes.id }).from(clientes).where(condicion);
    if (existente) throw new ErrorConflicto(`Ya existe un cliente con el email ${email}`, "email");
  }

  private static referenciaActividad(clienteId: number | string, id: number | string): ReferenciaActividad {
    return { clienteId: normalizarId(clienteId, "clienteId"), id: normalizarId(id) };
  }

  private static async exigirActividad(ref: ReferenciaActividad): Promise<Actividad> {
    const [actividad] = await Clientes.db.select().from(actividades).where(condicionActividad(ref));
    if (!actividad) throw new ErrorNoEncontrado("Actividad no encontrada");
    return actividad;
  }

  private static async exigirActividadPendiente(ref: ReferenciaActividad, accion: string): Promise<Actividad> {
    const actividad = await Clientes.exigirActividad(ref);
    if (actividad.fechaFinalizacion !== null) {
      throw new ErrorReglaNegocio(`La actividad ya está completada: no se puede ${accion}`);
    }
    return actividad;
  }

  /** Explica por qué una escritura condicionada a "pendiente" no afectó filas. */
  private static async fallarActividadNoPendiente(ref: ReferenciaActividad, accion: string): Promise<never> {
    await Clientes.exigirActividadPendiente(ref, accion);
    // Si llegó aquí, la actividad cambió de estado en medio de la operación.
    throw new ErrorConflicto("La actividad fue modificada por otra operación; vuelva a intentarlo");
  }

  // El chequeo previo da un mensaje claro; estos traductores cubren la carrera entre chequeo e inserción.
  private static async traducirEmailDuplicado<T>(operacion: Promise<T>, email: string | undefined): Promise<T> {
    try {
      return await operacion;
    } catch (error) {
      if (esViolacionUnica(error)) throw new ErrorConflicto(`Ya existe un cliente con el email ${email}`, "email");
      throw error;
    }
  }

  private static async traducirDescripcionDuplicada<T>(operacion: Promise<T>): Promise<T> {
    try {
      return await operacion;
    } catch (error) {
      if (esViolacionUnica(error)) {
        throw new ErrorConflicto("El cliente ya tiene una actividad con esa descripción", "descripcion");
      }
      throw error;
    }
  }
}
