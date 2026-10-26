import { and, eq, gt, gte, isNotNull, isNull, like, lt, lte, or, type SQL } from "drizzle-orm";
import type { Db } from "../db/client.js";
import {
  actividades,
  clientes,
  type Actividad,
  type Cliente,
  type NuevaActividad,
  type NuevoCliente,
} from "../db/schema.js";
import { ErrorConflicto, ErrorNoEncontrado, ErrorValidacion } from "./errores.js";
import * as n from "./normalizar.js";

export type EstadoActividad = "completada" | "vencida" | "pendiente";
export type ActividadConEstado = Actividad & { estado: EstadoActividad };
export type ClienteConActividades = Cliente & { actividades: ActividadConEstado[] };

const ESTADOS: EstadoActividad[] = ["completada", "vencida", "pendiente"];
const CAMPOS_TEXTO = ["nombre", "apellido", "email", "domicilio", "localidad", "telefono"] as const;

/** Búsqueda por cualquier campo (coincidencia parcial); `q` busca en todos los campos de texto. */
export type FiltroClientes = Partial<Record<(typeof CAMPOS_TEXTO)[number], string>> & {
  id?: number;
  q?: string;
};

/** Filtros combinables; las fechas son rangos inclusivos. */
export type FiltroActividades = {
  id?: number;
  clienteId?: number;
  descripcion?: string;
  estado?: EstadoActividad;
  compromisoDesde?: string;
  compromisoHasta?: string;
  finalizacionDesde?: string;
  finalizacionHasta?: string;
};

type CamposCliente = Omit<NuevoCliente, "id">;
type CamposActividad = Omit<NuevaActividad, "id" | "clienteId" | "fechaFinalizacion">;

const normalizadores: Record<(typeof CAMPOS_TEXTO)[number], (s: string) => string> = {
  nombre: n.nombre,
  apellido: n.nombre,
  email: n.email,
  domicilio: n.texto,
  localidad: n.texto,
  telefono: n.telefono,
};

export class Clientes {
  static db: Db;

  static conectar(db: Db) {
    Clientes.db = db;
  }

  // ---------- Clientes ----------

  static async crear(datos: CamposCliente, actividades: CamposActividad[] = []) {
    for (const campo of ["nombre", "apellido", "email"] as const) {
      if (datos[campo] === undefined) throw new ErrorValidacion(`El campo ${campo} es obligatorio`);
    }
    const valores = Clientes.normalizar(datos) as NuevoCliente;
    const [cliente] = await Clientes.sinDuplicados(
      () => Clientes.db.insert(clientes).values(valores).returning(),
      "Ya existe un cliente con ese email",
    );
    try {
      for (const a of actividades) await Clientes.crearActividad(cliente!.id, a);
    } catch (e) {
      await Clientes.db.delete(clientes).where(eq(clientes.id, cliente!.id)); // no dejar el alta a medias
      throw e;
    }
    return cliente!;
  }

  static async buscar(filtro: FiltroClientes = {}): Promise<ClienteConActividades[]> {
    const condiciones: (SQL | undefined)[] = [filtro.id === undefined ? undefined : eq(clientes.id, filtro.id)];
    for (const campo of CAMPOS_TEXTO) {
      const valor = filtro[campo];
      if (valor) condiciones.push(like(clientes[campo], `%${normalizadores[campo](valor)}%`));
    }
    if (filtro.q) {
      const q = filtro.q.trim();
      const porTexto = CAMPOS_TEXTO.map((c) => like(clientes[c], `%${c === "telefono" ? n.telefono(q) || q : q}%`));
      const idBuscado = /^#?\d+$/.test(q) ? eq(clientes.id, Number(q.replace("#", ""))) : undefined; // "#12" o "12"
      condiciones.push(or(...porTexto, idBuscado));
    }
    const filas = await Clientes.db.query.clientes.findMany({
      where: and(...condiciones),
      with: { actividades: true },
    });
    return filas.map((c) => ({ ...c, actividades: c.actividades.map(Clientes.conEstado) }));
  }

  static async obtener(id: number) {
    return (await Clientes.buscar({ id }))[0];
  }

  static async actualizar(id: number, cambios: Partial<CamposCliente>) {
    await Clientes.cliente(id);
    const [cliente] = await Clientes.sinDuplicados(
      () => Clientes.db.update(clientes).set(Clientes.normalizar(cambios)).where(eq(clientes.id, id)).returning(),
      "Ya existe un cliente con ese email",
    );
    return cliente!;
  }

  /** Elimina el cliente junto con todas sus actividades (incluidas las completadas). */
  static async eliminar(id: number) {
    await Clientes.cliente(id);
    await Clientes.db.delete(clientes).where(eq(clientes.id, id));
  }

  // ---------- Actividades ----------

  static estado(a: Pick<Actividad, "fechaCompromiso" | "fechaFinalizacion">): EstadoActividad {
    if (a.fechaFinalizacion) return "completada";
    if (a.fechaCompromiso && a.fechaCompromiso < n.hoy()) return "vencida";
    return "pendiente";
  }

  static async crearActividad(clienteId: number, datos: CamposActividad & { fechaFinalizacion?: string | null }) {
    await Clientes.cliente(clienteId);
    if (datos.descripcion === undefined) throw new ErrorValidacion("La descripción es obligatoria");
    const valores = { clienteId, ...Clientes.normalizarActividad(datos) } as NuevaActividad;
    const [actividad] = await Clientes.sinDuplicados(
      () => Clientes.db.insert(actividades).values(valores).returning(),
      "El cliente ya tiene una actividad con esa descripción",
    );
    return Clientes.conEstado(actividad!);
  }

  static async buscarActividades(filtro: FiltroActividades = {}) {
    const hoy = n.hoy();
    if (filtro.estado && !ESTADOS.includes(filtro.estado)) {
      throw new ErrorValidacion(`Estado inválido: ${filtro.estado} (${ESTADOS.join(", ")})`);
    }
    const condiciones: (SQL | undefined)[] = [
      filtro.id === undefined ? undefined : eq(actividades.id, filtro.id),
      filtro.clienteId === undefined ? undefined : eq(actividades.clienteId, filtro.clienteId),
      filtro.descripcion ? like(actividades.descripcion, `%${n.texto(filtro.descripcion)}%`) : undefined,
      filtro.compromisoDesde ? gte(actividades.fechaCompromiso, n.fecha(filtro.compromisoDesde)) : undefined,
      filtro.compromisoHasta ? lte(actividades.fechaCompromiso, n.fecha(filtro.compromisoHasta)) : undefined,
      filtro.finalizacionDesde ? gte(actividades.fechaFinalizacion, n.fecha(filtro.finalizacionDesde)) : undefined,
      filtro.finalizacionHasta ? lte(actividades.fechaFinalizacion, n.fecha(filtro.finalizacionHasta)) : undefined,
    ];
    if (filtro.estado === "completada") condiciones.push(isNotNull(actividades.fechaFinalizacion));
    if (filtro.estado === "vencida") {
      condiciones.push(isNull(actividades.fechaFinalizacion), lt(actividades.fechaCompromiso, hoy));
    }
    if (filtro.estado === "pendiente") {
      condiciones.push(
        isNull(actividades.fechaFinalizacion),
        or(isNull(actividades.fechaCompromiso), gte(actividades.fechaCompromiso, hoy)),
      );
    }
    const filas = await Clientes.db.select().from(actividades).where(and(...condiciones));
    return filas.map(Clientes.conEstado);
  }

  static async actualizarActividad(id: number, cambios: Partial<CamposActividad>) {
    await Clientes.actividadEditable(id, "editar");
    const [actividad] = await Clientes.sinDuplicados(
      () =>
        Clientes.db
          .update(actividades)
          .set(Clientes.normalizarActividad(cambios))
          .where(eq(actividades.id, id))
          .returning(),
      "El cliente ya tiene una actividad con esa descripción",
    );
    return Clientes.conEstado(actividad!);
  }

  /** Marca la actividad como completada con su fecha de ejecución (hoy por defecto). */
  static async completarActividad(id: number, fecha: string = n.hoy()) {
    await Clientes.actividadEditable(id, "completar");
    const [actividad] = await Clientes.db
      .update(actividades)
      .set({ fechaFinalizacion: n.fecha(fecha) })
      .where(eq(actividades.id, id))
      .returning();
    return Clientes.conEstado(actividad!);
  }

  static async eliminarActividad(id: number) {
    await Clientes.actividadEditable(id, "eliminar");
    await Clientes.db.delete(actividades).where(eq(actividades.id, id));
  }

  // ---------- Internos ----------

  private static conEstado = (a: Actividad): ActividadConEstado => ({ ...a, estado: Clientes.estado(a) });

  /** Devuelve el cliente o lanza ErrorNoEncontrado. */
  static async cliente(id: number) {
    const [c] = await Clientes.db.select().from(clientes).where(eq(clientes.id, id));
    if (!c) throw new ErrorNoEncontrado(`El cliente ${id} no existe`);
    return c;
  }

  /** Devuelve la actividad solo si pertenece al cliente; si no, lanza ErrorNoEncontrado. */
  static async actividad(clienteId: number, id: number) {
    await Clientes.cliente(clienteId);
    const [a] = await Clientes.db
      .select()
      .from(actividades)
      .where(and(eq(actividades.id, id), eq(actividades.clienteId, clienteId)));
    if (!a) throw new ErrorNoEncontrado(`El cliente ${clienteId} no tiene la actividad ${id}`);
    return Clientes.conEstado(a);
  }

  private static async sinDuplicados<T>(consulta: () => Promise<T>, mensaje: string): Promise<T> {
    try {
      return await consulta();
    } catch (e) {
      const detalle = [e, (e as { cause?: unknown }).cause].map(String).join(" ");
      if (detalle.includes("UNIQUE constraint failed")) throw new ErrorConflicto(mensaje);
      throw e;
    }
  }

  private static async actividadEditable(id: number, accion: string) {
    const [a] = await Clientes.db.select().from(actividades).where(eq(actividades.id, id));
    if (!a) throw new ErrorNoEncontrado(`La actividad ${id} no existe`);
    if (a.fechaFinalizacion) throw new ErrorConflicto(`No se puede ${accion} una actividad completada (${id})`);
    return a;
  }

  private static normalizar(datos: Partial<CamposCliente>) {
    const salida: Record<string, string | null> = {};
    for (const [campo, valor] of Object.entries(datos) as [keyof typeof normalizadores, string | null][]) {
      const fn = normalizadores[campo];
      if (!fn || valor === undefined) continue; // se ignoran campos desconocidos (p. ej. id)
      if (typeof valor !== "string" && valor !== null) throw new ErrorValidacion(`El campo ${campo} debe ser texto`);
      salida[campo] = campo === "domicilio" || campo === "localidad" || campo === "telefono"
        ? n.opcional(valor, fn)
        : fn(valor!);
      if (!salida[campo] && (campo === "nombre" || campo === "apellido" || campo === "email")) {
        throw new ErrorValidacion(`El campo ${campo} es obligatorio`);
      }
    }
    if (salida.email && !/^\S+@\S+\.\S+$/.test(salida.email)) throw new ErrorValidacion(`Email inválido: ${salida.email}`);
    return salida as Partial<NuevoCliente>;
  }

  private static normalizarActividad(datos: Partial<CamposActividad> & { fechaFinalizacion?: string | null }) {
    const salida: Partial<NuevaActividad> = {};
    if (datos.descripcion !== undefined) {
      if (typeof datos.descripcion !== "string") throw new ErrorValidacion("La descripción debe ser texto");
      salida.descripcion = n.texto(datos.descripcion);
      if (!salida.descripcion) throw new ErrorValidacion("La descripción es obligatoria");
    }
    for (const campo of ["fechaCompromiso", "fechaFinalizacion"] as const) {
      const valor = datos[campo];
      if (valor !== undefined) salida[campo] = valor === null || valor === "" ? null : n.fecha(valor);
    }
    return salida;
  }
}
