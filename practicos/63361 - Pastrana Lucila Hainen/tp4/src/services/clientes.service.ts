import { and, asc, eq, ne } from "drizzle-orm";
import { db } from "../db";
import { actividades, clientes, type Actividad, type Cliente, type NuevaActividad, type NuevoCliente } from "../db/schema";
import { ErrorNoEncontrado, ErrorReglaNegocio, ErrorValidacion } from "./errores";
import {
  hoy,
  normalizarEmail,
  normalizarFecha,
  normalizarNombre,
  normalizarTelefono,
  normalizarTexto,
  plegar,
  requerido,
  validarEmail,
} from "./normalizar";

export type DatosCliente = Omit<NuevoCliente, "id">;
export type CambiosCliente = Partial<DatosCliente>;
export type DatosActividad = Pick<NuevaActividad, "descripcion" | "fechaCompromiso">;
export type CambiosActividad = Partial<DatosActividad>;

export type CampoCliente = keyof DatosCliente;
export type FiltroCliente = Partial<Record<CampoCliente, string>>;

export type ActividadConEstado = Actividad & { completada: boolean; vencida: boolean };
export type ClienteConActividades = Cliente & { actividades: ActividadConEstado[] };

const camposBusqueda: CampoCliente[] = ["nombre", "apellido", "email", "domicilio", "localidad", "telefono"];

export class Clientes {
  // ───────────── Clientes ─────────────

  /**
   * Búsqueda flexible.
   * - Texto: cada palabra debe aparecer en algún campo ("ana tucuman" -> nombre Ana y localidad Tucumán).
   * - Objeto: filtra por los campos indicados ({ localidad: "yerba" }).
   * Sin consulta devuelve todos.
   */
  static async buscar(consulta: string | FiltroCliente = ""): Promise<Cliente[]> {
    // SQLite LIKE no ignora acentos ni mayúsculas fuera de ASCII: se filtra en memoria
    // (volumen de un mini CRM) comparando texto plegado ("Tucumán" ~ "tucuman").
    const todos = await db.select().from(clientes).orderBy(asc(clientes.apellido), asc(clientes.nombre));

    if (typeof consulta === "string") {
      const terminos = plegar(consulta).split(/\s+/).filter(Boolean);
      if (!terminos.length) return todos;
      return todos.filter((c) => {
        const campos = camposBusqueda.map((k) => plegar(c[k] ?? ""));
        return terminos.every((t) => {
          // "555-1234" también encuentra el teléfono guardado como "3815551234".
          const digitos = /^[\d\s()+-]+$/.test(t) ? t.replace(/\D/g, "") : "";
          return campos.some((v) => v.includes(t)) || (!!digitos && (c.telefono ?? "").includes(digitos));
        });
      });
    }

    const filtros = Object.entries(consulta)
      .filter(([campo, valor]) => camposBusqueda.includes(campo as CampoCliente) && valor?.trim())
      .map(([campo, valor]) => [campo as CampoCliente, plegar(valor!)] as const);
    return todos.filter((c) => filtros.every(([campo, valor]) => plegar(c[campo] ?? "").includes(valor)));
  }

  static listar(): Promise<Cliente[]> {
    return Clientes.buscar();
  }

  /** Cliente con sus actividades (pendientes primero). */
  static async obtener(id: number): Promise<ClienteConActividades> {
    const cliente = await Clientes.#clienteOError(id);
    return { ...cliente, actividades: await Clientes.listarActividades(id) };
  }

  static async crear(datos: DatosCliente): Promise<Cliente> {
    const valores = Clientes.#normalizarCliente(datos);
    await Clientes.#verificarEmailLibre(valores.email);
    const [creado] = await db.insert(clientes).values(valores).returning();
    return creado!;
  }

  static async actualizar(id: number, cambios: CambiosCliente): Promise<Cliente> {
    const actual = await Clientes.#clienteOError(id);
    const valores = Clientes.#normalizarCliente({ ...actual, ...cambios });
    await Clientes.#verificarEmailLibre(valores.email, id);
    const [actualizado] = await db.update(clientes).set(valores).where(eq(clientes.id, id)).returning();
    return actualizado!;
  }

  /** Elimina el cliente junto con todas sus actividades (incluidas las completadas). */
  static async eliminar(id: number): Promise<void> {
    await Clientes.#clienteOError(id);
    await db.transaction(async (tx) => {
      await tx.delete(actividades).where(eq(actividades.clienteId, id));
      await tx.delete(clientes).where(eq(clientes.id, id));
    });
  }

  // ───────────── Actividades ─────────────

  // Cada actividad se identifica por (clienteId, id): una actividad de otro cliente se trata como inexistente.

  static async listarActividades(clienteId: number): Promise<ActividadConEstado[]> {
    await Clientes.#clienteOError(clienteId);
    const filas = await db.select().from(actividades).where(eq(actividades.clienteId, clienteId));
    return filas.map(Clientes.#conEstado).sort(Clientes.#ordenActividades);
  }

  static async obtenerActividad(clienteId: number, id: number): Promise<ActividadConEstado> {
    return Clientes.#conEstado(await Clientes.#actividadOError(clienteId, id));
  }

  static async crearActividad(clienteId: number, datos: DatosActividad): Promise<ActividadConEstado> {
    await Clientes.#clienteOError(clienteId);
    const [creada] = await db
      .insert(actividades)
      .values({ clienteId, ...Clientes.#normalizarActividad(datos) })
      .returning();
    return Clientes.#conEstado(creada!);
  }

  static async actualizarActividad(clienteId: number, id: number, cambios: CambiosActividad): Promise<ActividadConEstado> {
    const actual = await Clientes.#pendienteOError(clienteId, id, "editar");
    const valores = Clientes.#normalizarActividad({ ...actual, ...cambios });
    const [actualizada] = await db.update(actividades).set(valores).where(eq(actividades.id, id)).returning();
    return Clientes.#conEstado(actualizada!);
  }

  static async eliminarActividad(clienteId: number, id: number): Promise<void> {
    await Clientes.#pendienteOError(clienteId, id, "eliminar");
    await db.delete(actividades).where(eq(actividades.id, id));
  }

  /** Marca la actividad como completada, fijando la fecha de ejecución (hoy por defecto). */
  static async completarActividad(clienteId: number, id: number, fecha?: string | null): Promise<ActividadConEstado> {
    await Clientes.#pendienteOError(clienteId, id, "completar");
    const fechaFinalizacion = normalizarFecha(fecha) ?? hoy();
    const [completada] = await db
      .update(actividades)
      .set({ fechaFinalizacion })
      .where(eq(actividades.id, id))
      .returning();
    return Clientes.#conEstado(completada!);
  }

  /** Vencida: pendiente con fecha de compromiso anterior a la fecha actual. */
  static estaVencida(actividad: Pick<Actividad, "fechaCompromiso" | "fechaFinalizacion">, fechaActual = hoy()): boolean {
    return !actividad.fechaFinalizacion && !!actividad.fechaCompromiso && actividad.fechaCompromiso < fechaActual;
  }

  // ───────────── Auxiliares ─────────────

  static #normalizarCliente(datos: DatosCliente): DatosCliente {
    const localidad = normalizarTexto(datos.localidad);
    return {
      nombre: normalizarNombre(requerido(datos.nombre, "nombre")),
      apellido: normalizarNombre(requerido(datos.apellido, "apellido")),
      email: validarEmail(normalizarEmail(requerido(datos.email, "email"))),
      domicilio: normalizarTexto(datos.domicilio),
      localidad: localidad && normalizarNombre(localidad),
      telefono: normalizarTelefono(datos.telefono),
    };
  }

  static #normalizarActividad(datos: DatosActividad): DatosActividad {
    return {
      descripcion: requerido(datos.descripcion, "descripcion"),
      fechaCompromiso: normalizarFecha(datos.fechaCompromiso),
    };
  }

  static async #verificarEmailLibre(email: string, exceptoId?: number): Promise<void> {
    const [existente] = await db
      .select({ id: clientes.id })
      .from(clientes)
      .where(and(eq(clientes.email, email), exceptoId ? ne(clientes.id, exceptoId) : undefined));
    if (existente) throw new ErrorValidacion(`Ya existe un cliente con el email "${email}"`);
  }

  static async #clienteOError(id: number): Promise<Cliente> {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id));
    if (!cliente) throw new ErrorNoEncontrado(`Cliente ${id} no encontrado`);
    return cliente;
  }

  static async #actividadOError(clienteId: number, id: number): Promise<Actividad> {
    await Clientes.#clienteOError(clienteId);
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(and(eq(actividades.id, id), eq(actividades.clienteId, clienteId)));
    if (!actividad) throw new ErrorNoEncontrado(`Actividad ${id} no encontrada para el cliente ${clienteId}`);
    return actividad;
  }

  static async #pendienteOError(clienteId: number, id: number, accion: string): Promise<Actividad> {
    const actividad = await Clientes.#actividadOError(clienteId, id);
    if (actividad.fechaFinalizacion) {
      throw new ErrorReglaNegocio(`No se puede ${accion} la actividad ${id}: ya está completada`);
    }
    return actividad;
  }

  static #conEstado(a: Actividad): ActividadConEstado {
    return { ...a, completada: !!a.fechaFinalizacion, vencida: Clientes.estaVencida(a) };
  }

  /** Pendientes por fecha de compromiso (sin fecha al final); luego completadas, la más reciente primero. */
  static #ordenActividades(a: ActividadConEstado, b: ActividadConEstado): number {
    if (a.completada !== b.completada) return a.completada ? 1 : -1;
    if (a.completada) return (b.fechaFinalizacion ?? "").localeCompare(a.fechaFinalizacion ?? "");
    if (a.fechaCompromiso === b.fechaCompromiso) return a.id - b.id;
    if (!a.fechaCompromiso) return 1;
    if (!b.fechaCompromiso) return -1;
    return a.fechaCompromiso.localeCompare(b.fechaCompromiso);
  }
}
