import { and, eq, like, or, sql, type SQL } from "drizzle-orm";

import { db } from "../db/index.js";
import { actividades, clientes } from "../db/schema.js";

export type CodigoError = "VALIDACION" | "NO_ENCONTRADO" | "CONFLICTO";

export class ErrorDeNegocio extends Error {
  constructor(
    message: string,
    public readonly codigo: CodigoError,
  ) {
    super(message);
    this.name = "ErrorDeNegocio";
  }
}

type CamposCliente = "nombre" | "apellido" | "email" | "domicilio" | "localidad" | "telefono";
type DatosEntrada = Record<string, unknown>;

const camposCliente: CamposCliente[] = [
  "nombre",
  "apellido",
  "email",
  "domicilio",
  "localidad",
  "telefono",
];

function validarId(id: number): void {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorDeNegocio("El identificador debe ser un entero positivo.", "VALIDACION");
  }
}

function leerTexto(valor: unknown, campo: string, requerido: boolean): string | null {
  if (valor === undefined || valor === null) {
    if (requerido) throw new ErrorDeNegocio(`El campo ${campo} es obligatorio.`, "VALIDACION");
    return null;
  }
  if (typeof valor !== "string") {
    throw new ErrorDeNegocio(`El campo ${campo} debe ser texto.`, "VALIDACION");
  }

  const texto = valor.normalize("NFC").trim().replace(/\s+/g, " ");
  if (texto.length === 0) {
    if (requerido) throw new ErrorDeNegocio(`El campo ${campo} es obligatorio.`, "VALIDACION");
    return null;
  }
  return texto;
}

function normalizarNombre(valor: unknown, campo: string): string {
  const texto = leerTexto(valor, campo, true)!;
  if (texto.length > 100) {
    throw new ErrorDeNegocio(`${campo} no puede superar los 100 caracteres.`, "VALIDACION");
  }
  return texto
    .toLocaleLowerCase("es-AR")
    .replace(/(^|[\s'-])([\p{L}])/gu, (_match, separador: string, letra: string) =>
      separador + letra.toLocaleUpperCase("es-AR"),
    );
}

function normalizarEmail(valor: unknown): string {
  const email = leerTexto(valor, "email", true)!.toLocaleLowerCase("en-US");
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ErrorDeNegocio("Ingresá un email válido.", "VALIDACION");
  }
  return email;
}

function normalizarTelefono(valor: unknown): string | null {
  const telefono = leerTexto(valor, "telefono", false);
  if (telefono === null) return null;
  const normalizado = telefono.replace(/[\s().-]+/g, " ").trim();
  if (normalizado.length > 40) {
    throw new ErrorDeNegocio("El teléfono no puede superar los 40 caracteres.", "VALIDACION");
  }
  return normalizado;
}

function normalizarCampoOpcional(valor: unknown, campo: string): string | null {
  const texto = leerTexto(valor, campo, false);
  if (texto !== null && texto.length > 200) {
    throw new ErrorDeNegocio(`${campo} no puede superar los 200 caracteres.`, "VALIDACION");
  }
  return texto;
}

function normalizarFecha(valor: unknown, campo: string): string | null {
  if (valor === undefined || valor === null || valor === "") return null;
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw new ErrorDeNegocio(`${campo} debe tener el formato AAAA-MM-DD.`, "VALIDACION");
  }
  const fecha = new Date(`${valor}T00:00:00.000Z`);
  if (Number.isNaN(fecha.valueOf()) || fecha.toISOString().slice(0, 10) !== valor) {
    throw new ErrorDeNegocio(`${campo} no es una fecha válida.`, "VALIDACION");
  }
  return valor;
}

function mapearErrorDeUnicidad(error: unknown): never {
  let actual: unknown = error;
  while (actual !== null && typeof actual === "object") {
    if (actual instanceof Error && /unique constraint|clientes\.email/i.test(actual.message)) {
      throw new ErrorDeNegocio("Ya existe un cliente con ese email.", "CONFLICTO");
    }
    actual = "cause" in actual ? actual.cause : null;
  }
  throw error;
}

function prepararCliente(entrada: DatosEntrada, parcial: boolean): Partial<typeof clientes.$inferInsert> {
  const datos: Partial<typeof clientes.$inferInsert> = {};
  const presentes = camposCliente.filter((campo) => Object.hasOwn(entrada, campo));

  if (!parcial && camposCliente.slice(0, 3).some((campo) => !Object.hasOwn(entrada, campo))) {
    throw new ErrorDeNegocio("Nombre, apellido y email son obligatorios.", "VALIDACION");
  }
  if (parcial && presentes.length === 0) {
    throw new ErrorDeNegocio("Indicá al menos un campo para actualizar.", "VALIDACION");
  }

  for (const campo of presentes) {
    switch (campo) {
      case "nombre":
      case "apellido":
        datos[campo] = normalizarNombre(entrada[campo], campo);
        break;
      case "email":
        datos.email = normalizarEmail(entrada.email);
        break;
      case "telefono":
        datos.telefono = normalizarTelefono(entrada.telefono);
        break;
      case "domicilio":
      case "localidad":
        datos[campo] = normalizarCampoOpcional(entrada[campo], campo);
        break;
    }
  }
  return datos;
}

function textoParaBusqueda(valor: string): string {
  return `%${valor.trim().toLocaleLowerCase("es-AR")}%`;
}

export class Clientes {
  static async listar(busqueda = "") {
    const consulta = busqueda.trim();
    if (consulta.length === 0) return db.select().from(clientes).orderBy(clientes.apellido, clientes.nombre);

    const patron = textoParaBusqueda(consulta);
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
            or cast(${actividades.id} as text) like ${patron}
            or coalesce(${actividades.fechaCompromiso}, '') like ${patron}
            or coalesce(${actividades.fechaFinalizacion}, '') like ${patron}
          )
      )`,
    ];

    return db.select().from(clientes)
      .where(or(...coincidencias))
      .orderBy(clientes.apellido, clientes.nombre);
  }

  static async obtenerPorId(id: number) {
    validarId(id);
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
    if (!cliente) throw new ErrorDeNegocio("No se encontró el cliente.", "NO_ENCONTRADO");
    const actividadesDelCliente = await Clientes.listarActividades(id);
    return { ...cliente, actividades: actividadesDelCliente };
  }

  static async crear(entrada: DatosEntrada) {
    const datos = prepararCliente(entrada, false);
    try {
      const [cliente] = await db.insert(clientes).values(datos as typeof clientes.$inferInsert).returning();
      return cliente;
    } catch (error) {
      return mapearErrorDeUnicidad(error);
    }
  }

  static async actualizar(id: number, entrada: DatosEntrada) {
    validarId(id);
    const datos = prepararCliente(entrada, true);
    try {
      const [cliente] = await db.update(clientes).set(datos).where(eq(clientes.id, id)).returning();
      if (!cliente) throw new ErrorDeNegocio("No se encontró el cliente.", "NO_ENCONTRADO");
      return cliente;
    } catch (error) {
      return mapearErrorDeUnicidad(error);
    }
  }

  static async eliminar(id: number): Promise<void> {
    validarId(id);
    await db.transaction(async (tx) => {
      const [cliente] = await tx.select({ id: clientes.id }).from(clientes).where(eq(clientes.id, id)).limit(1);
      if (!cliente) throw new ErrorDeNegocio("No se encontró el cliente.", "NO_ENCONTRADO");

      // Borrado explícito para preservar integridad tanto en SQLite como en Turso.
      await tx.delete(actividades).where(eq(actividades.clienteId, id));
      await tx.delete(clientes).where(eq(clientes.id, id));
    });
  }

  static async listarActividades(clienteId: number) {
    validarId(clienteId);
    const [cliente] = await db.select({ id: clientes.id }).from(clientes).where(eq(clientes.id, clienteId)).limit(1);
    if (!cliente) throw new ErrorDeNegocio("No se encontró el cliente.", "NO_ENCONTRADO");
    return db.select().from(actividades)
      .where(eq(actividades.clienteId, clienteId))
      .orderBy(actividades.id);
  }

  static async crearActividad(clienteId: number, entrada: DatosEntrada) {
    validarId(clienteId);
    const descripcion = leerTexto(entrada.descripcion, "descripcion", true)!;
    if (descripcion.length > 500) {
      throw new ErrorDeNegocio("La descripción no puede superar los 500 caracteres.", "VALIDACION");
    }
    const fechaCompromiso = normalizarFecha(entrada.fechaCompromiso, "fechaCompromiso");
    const [cliente] = await db.select({ id: clientes.id }).from(clientes).where(eq(clientes.id, clienteId)).limit(1);
    if (!cliente) throw new ErrorDeNegocio("No se encontró el cliente.", "NO_ENCONTRADO");

    const [actividad] = await db.insert(actividades).values({
      clienteId,
      descripcion,
      fechaCompromiso,
      fechaFinalizacion: null,
    }).returning();
    return actividad;
  }

  static async actualizarActividad(id: number, entrada: DatosEntrada) {
    validarId(id);
    const [actual] = await db.select().from(actividades).where(eq(actividades.id, id)).limit(1);
    if (!actual) throw new ErrorDeNegocio("No se encontró la actividad.", "NO_ENCONTRADO");
    if (actual.fechaFinalizacion !== null) {
      throw new ErrorDeNegocio("Las actividades completadas no se pueden modificar.", "CONFLICTO");
    }

    const cambios: Partial<typeof actividades.$inferInsert> = {};
    if (Object.hasOwn(entrada, "descripcion")) {
      const descripcion = leerTexto(entrada.descripcion, "descripcion", true)!;
      if (descripcion.length > 500) {
        throw new ErrorDeNegocio("La descripción no puede superar los 500 caracteres.", "VALIDACION");
      }
      cambios.descripcion = descripcion;
    }
    if (Object.hasOwn(entrada, "fechaCompromiso")) {
      cambios.fechaCompromiso = normalizarFecha(entrada.fechaCompromiso, "fechaCompromiso");
    }
    if (Object.keys(cambios).length === 0) {
      throw new ErrorDeNegocio("Indicá la descripción o fecha para actualizar.", "VALIDACION");
    }

    const [actividad] = await db.update(actividades).set(cambios).where(
      and(eq(actividades.id, id), sql`${actividades.fechaFinalizacion} is null`),
    ).returning();
    if (!actividad) {
      throw new ErrorDeNegocio("La actividad ya fue completada y no se puede modificar.", "CONFLICTO");
    }
    return actividad;
  }

  static async completarActividad(id: number) {
    validarId(id);
    const [actividad] = await db.update(actividades)
      .set({ fechaFinalizacion: sql`date('now')` })
      .where(and(eq(actividades.id, id), sql`${actividades.fechaFinalizacion} is null`))
      .returning();
    if (actividad) return actividad;

    const [existente] = await db.select({ id: actividades.id }).from(actividades)
      .where(eq(actividades.id, id)).limit(1);
    if (!existente) throw new ErrorDeNegocio("No se encontró la actividad.", "NO_ENCONTRADO");
    throw new ErrorDeNegocio("La actividad ya está completada.", "CONFLICTO");
  }

  static async eliminarActividad(id: number): Promise<void> {
    validarId(id);
    const [actividad] = await db.delete(actividades).where(
      and(eq(actividades.id, id), sql`${actividades.fechaFinalizacion} is null`),
    ).returning({ id: actividades.id });
    if (actividad) return;

    const [existente] = await db.select().from(actividades).where(eq(actividades.id, id)).limit(1);
    if (!existente) throw new ErrorDeNegocio("No se encontró la actividad.", "NO_ENCONTRADO");
    throw new ErrorDeNegocio("Las actividades completadas no se pueden eliminar.", "CONFLICTO");
  }
}
