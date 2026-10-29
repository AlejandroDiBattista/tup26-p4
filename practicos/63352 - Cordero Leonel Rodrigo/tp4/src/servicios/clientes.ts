import { and, eq, like, or, sql, type SQL } from "drizzle-orm";

import { db } from "../db/conexion.js";
import { actividades, clientes, type Actividad, type NuevoCliente } from "../db/esquema.js";
import { ErrorConflicto, ErrorNoEncontrado, ErrorValidacion } from "./errores.js";

export type EstadoActividad = "completada" | "vencida" | "pendiente";
export type ActividadConEstado = Actividad & { estado: EstadoActividad };
export type ClienteConActividades = typeof clientes.$inferSelect & { actividades: ActividadConEstado[] };

const CAMPOS = ["nombre", "apellido", "email", "domicilio", "localidad", "telefono"] as const;

function hoy(): string {
  return new Date().toLocaleDateString("en-CA");
}

function texto(valor: unknown, campo: string, obligatorio: boolean): string | null {
  if (valor === undefined || valor === null) {
    if (obligatorio) throw new ErrorValidacion(`El campo ${campo} es obligatorio`);
    return null;
  }
  if (typeof valor !== "string") throw new ErrorValidacion(`El campo ${campo} debe ser texto`);
  const limpio = valor.normalize("NFC").trim().replace(/\s+/g, " ");
  if (!limpio) {
    if (obligatorio) throw new ErrorValidacion(`El campo ${campo} es obligatorio`);
    return null;
  }
  return limpio;
}

function nombre(valor: unknown, campo: string): string {
  const limpio = texto(valor, campo, true)!;
  return limpio
    .toLocaleLowerCase("es-AR")
    .replace(/(^|[\s'-])(\p{L})/gu, (_m, sep: string, letra: string) => sep + letra.toLocaleUpperCase("es-AR"));
}

function email(valor: unknown): string {
  const limpio = texto(valor, "email", true)!.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) throw new ErrorValidacion("Ingresá un email válido");
  return limpio;
}

function fecha(valor: unknown, campo: string): string | null {
  if (valor === undefined || valor === null || valor === "") return null;
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw new ErrorValidacion(`${campo} debe tener el formato AAAA-MM-DD`);
  }
  const parsed = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(parsed.valueOf())) throw new ErrorValidacion(`${campo} no es una fecha válida`);
  return valor;
}

function idEntero(valor: number, nombreCampo = "id"): number {
  if (!Number.isInteger(valor) || valor <= 0) {
    throw new ErrorValidacion(`${nombreCampo} inválido`);
  }
  return valor;
}

function estadoDe(a: Pick<Actividad, "fechaCompromiso" | "fechaFinalizacion">): EstadoActividad {
  if (a.fechaFinalizacion) return "completada";
  if (a.fechaCompromiso && a.fechaCompromiso < hoy()) return "vencida";
  return "pendiente";
}

function conEstado(a: Actividad): ActividadConEstado {
  return { ...a, estado: estadoDe(a) };
}

function esUnico(error: unknown): boolean {
  const mensaje = [error, error instanceof Error ? error.cause : null].map(String).join(" ");
  return /unique constraint failed/i.test(mensaje);
}

async function sinDuplicados<T>(consulta: () => Promise<T>, mensaje: string): Promise<T> {
  try {
    return await consulta();
  } catch (error) {
    if (esUnico(error)) throw new ErrorConflicto(mensaje);
    throw error;
  }
}

function prepararCliente(entrada: Record<string, unknown>, parcial: boolean): Partial<NuevoCliente> {
  const datos: Partial<NuevoCliente> = {};
  const presentes = CAMPOS.filter((campo) => Object.hasOwn(entrada, campo));

  if (!parcial) {
    for (const campo of ["nombre", "apellido", "email"] as const) {
      if (!Object.hasOwn(entrada, campo)) throw new ErrorValidacion(`El campo ${campo} es obligatorio`);
    }
  } else if (presentes.length === 0) {
    throw new ErrorValidacion("Indicá al menos un campo para actualizar");
  }

  for (const campo of presentes) {
    switch (campo) {
      case "nombre":
      case "apellido":
        datos[campo] = nombre(entrada[campo], campo);
        break;
      case "email":
        datos.email = email(entrada.email);
        break;
      default:
        datos[campo] = texto(entrada[campo], campo, false);
    }
  }
  return datos;
}

export class Clientes {
  static async buscar(q = ""): Promise<(typeof clientes.$inferSelect)[]> {
    const consulta = q.trim();
    const orden = db.select().from(clientes).orderBy(clientes.nombre, clientes.apellido);
    if (!consulta) return orden;

    const patron = `%${consulta.toLocaleLowerCase("es-AR")}%`;
    const coincidencias: SQL[] = [
      like(sql`lower(${clientes.nombre})`, patron),
      like(sql`lower(${clientes.apellido})`, patron),
      like(sql`lower(${clientes.email})`, patron),
      like(sql`lower(coalesce(${clientes.domicilio}, ''))`, patron),
      like(sql`lower(coalesce(${clientes.localidad}, ''))`, patron),
      like(sql`lower(coalesce(${clientes.telefono}, ''))`, patron),
      like(sql`cast(${clientes.id} as text)`, patron),
      sql`exists (
        select 1 from ${actividades}
        where ${actividades.clienteId} = ${clientes.id}
          and (
            lower(${actividades.descripcion}) like ${patron}
            or coalesce(${actividades.fechaCompromiso}, '') like ${patron}
            or coalesce(${actividades.fechaFinalizacion}, '') like ${patron}
          )
      )`,
    ];

    return db.select().from(clientes).where(or(...coincidencias)).orderBy(clientes.nombre, clientes.apellido);
  }

  static async obtener(id: number): Promise<ClienteConActividades> {
    idEntero(id);
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
    if (!cliente) throw new ErrorNoEncontrado(`El cliente ${id} no existe`);
    const lista = await db.select().from(actividades).where(eq(actividades.clienteId, id)).orderBy(actividades.id);
    return { ...cliente, actividades: lista.map(conEstado) };
  }

  static async crear(entrada: Record<string, unknown>) {
    const datos = prepararCliente(entrada, false) as NuevoCliente;
    const [cliente] = await sinDuplicados(
      () => db.insert(clientes).values(datos).returning(),
      "Ya existe un cliente con ese email",
    );
    return cliente!;
  }

  static async actualizar(id: number, entrada: Record<string, unknown>) {
    idEntero(id);
    await Clientes.obtener(id);
    const datos = prepararCliente(entrada, true);
    const [cliente] = await sinDuplicados(
      () => db.update(clientes).set(datos).where(eq(clientes.id, id)).returning(),
      "Ya existe un cliente con ese email",
    );
    if (!cliente) throw new ErrorNoEncontrado(`El cliente ${id} no existe`);
    return cliente;
  }

  static async eliminar(id: number): Promise<void> {
    idEntero(id);
    await Clientes.obtener(id);
    await db.delete(actividades).where(eq(actividades.clienteId, id));
    await db.delete(clientes).where(eq(clientes.id, id));
  }

  static async crearActividad(clienteId: number, entrada: Record<string, unknown>) {
    idEntero(clienteId, "clienteId");
    await Clientes.obtener(clienteId);
    const descripcion = texto(entrada.descripcion, "descripcion", true)!;
    const [actividad] = await db
      .insert(actividades)
      .values({
        clienteId,
        descripcion,
        fechaCompromiso: fecha(entrada.fechaCompromiso, "fechaCompromiso"),
        fechaFinalizacion: null,
      })
      .returning();
    return conEstado(actividad!);
  }

  static async actualizarActividad(id: number, entrada: Record<string, unknown>) {
    const actual = await Clientes.actividadEditable(id, "editar");
    const cambios: Partial<typeof actividades.$inferInsert> = {};
    if (Object.hasOwn(entrada, "descripcion")) {
      cambios.descripcion = texto(entrada.descripcion, "descripcion", true)!;
    }
    if (Object.hasOwn(entrada, "fechaCompromiso")) {
      cambios.fechaCompromiso = fecha(entrada.fechaCompromiso, "fechaCompromiso");
    }
    if (Object.keys(cambios).length === 0) {
      throw new ErrorValidacion("Indicá la descripción o la fecha para actualizar");
    }
    const [actividad] = await db
      .update(actividades)
      .set(cambios)
      .where(and(eq(actividades.id, actual.id), sql`${actividades.fechaFinalizacion} is null`))
      .returning();
    if (!actividad) throw new ErrorConflicto("La actividad ya fue completada y no se puede modificar");
    return conEstado(actividad);
  }

  static async completarActividad(id: number) {
    await Clientes.actividadEditable(id, "completar");
    const [actividad] = await db
      .update(actividades)
      .set({ fechaFinalizacion: hoy() })
      .where(and(eq(actividades.id, id), sql`${actividades.fechaFinalizacion} is null`))
      .returning();
    if (!actividad) throw new ErrorConflicto("La actividad ya está completada");
    return conEstado(actividad);
  }

  static async eliminarActividad(id: number): Promise<void> {
    await Clientes.actividadEditable(id, "eliminar");
    await db.delete(actividades).where(and(eq(actividades.id, id), sql`${actividades.fechaFinalizacion} is null`));
  }

  private static async actividadEditable(id: number, accion: string) {
    idEntero(id);
    const [actividad] = await db.select().from(actividades).where(eq(actividades.id, id)).limit(1);
    if (!actividad) throw new ErrorNoEncontrado(`La actividad ${id} no existe`);
    if (actividad.fechaFinalizacion) {
      throw new ErrorConflicto(`No se puede ${accion} una actividad completada`);
    }
    return actividad;
  }
}

