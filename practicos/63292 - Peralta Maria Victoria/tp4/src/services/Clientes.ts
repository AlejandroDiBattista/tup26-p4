import { and, desc, eq, like, or, type SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { db } from "../db/index.js";
import { actividades, clientes } from "../db/schema.js";

export class ErrorServicio extends Error {
  constructor(
    readonly estado: number,
    mensaje: string
  ) {
    super(mensaje);
  }
}

const CAMPOS: Record<string, SQLiteColumn> = {
  id: clientes.id,
  nombre: clientes.nombre,
  email: clientes.email,
  telefono: clientes.telefono,
  direccion: clientes.direccion,
};

type Entrada = Record<string, unknown>;

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function validarCliente(datos: Entrada) {
  const cliente = {
    nombre: texto(datos.nombre),
    email: texto(datos.email),
    telefono: texto(datos.telefono),
    direccion: texto(datos.direccion),
  };
  if (!cliente.nombre) throw new ErrorServicio(400, "El nombre es obligatorio");
  if (cliente.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email)) {
    throw new ErrorServicio(400, "El email no es válido");
  }
  return cliente;
}

function validarActividad(datos: Entrada) {
  const descripcion = texto(datos.descripcion);
  const fecha = texto(datos.fecha);
  if (!descripcion) throw new ErrorServicio(400, "La descripción es obligatoria");
  if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new ErrorServicio(400, "La fecha debe tener formato AAAA-MM-DD");
  }
  return { descripcion, fecha: fecha || null };
}

export class Clientes {
  /** Lista clientes. Con `q` busca en todos los campos, o solo en `campo` si se indica. */
  static async buscar(q?: string, campo?: string) {
    const buscado = q?.trim();
    let where: SQL | undefined;
    if (buscado) {
      const patron = `%${buscado}%`;
      if (campo) {
        const columna = CAMPOS[campo];
        if (!columna) throw new ErrorServicio(400, `Campo inválido: ${campo}`);
        where = like(columna, patron);
      } else {
        where = or(...Object.values(CAMPOS).map((c) => like(c, patron)));
      }
    }
    return db.select().from(clientes).where(where).orderBy(clientes.nombre).all();
  }

  static async obtener(id: number) {
    const cliente = await db
      .select()
      .from(clientes)
      .where(eq(clientes.id, id))
      .get();
    if (!cliente) throw new ErrorServicio(404, "Cliente no encontrado");
    const acts = await db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, id))
      .orderBy(desc(actividades.fecha), desc(actividades.id))
      .all();
    return { ...cliente, actividades: acts };
  }

  static async crear(datos: Entrada) {
    const cliente = validarCliente(datos);
    return db.insert(clientes).values(cliente).returning().get();
  }

  static async actualizar(id: number, datos: Entrada) {
    const cliente = validarCliente(datos);
    const actualizado = await db
      .update(clientes)
      .set(cliente)
      .where(eq(clientes.id, id))
      .returning()
      .get();
    if (!actualizado) throw new ErrorServicio(404, "Cliente no encontrado");
    return actualizado;
  }

  static async eliminar(id: number) {
    const resultado = await db.delete(clientes).where(eq(clientes.id, id));
    if (resultado.rowsAffected === 0)
      throw new ErrorServicio(404, "Cliente no encontrado");
  }

  // ---- Actividades ----

  private static async actividad(clienteId: number, id: number) {
    const actividad = await db
      .select()
      .from(actividades)
      .where(and(eq(actividades.id, id), eq(actividades.clienteId, clienteId)))
      .get();
    if (!actividad) throw new ErrorServicio(404, "Actividad no encontrada");
    return actividad;
  }

  static async agregarActividad(clienteId: number, datos: Entrada) {
    await Clientes.obtener(clienteId); // valida que el cliente exista
    const actividad = validarActividad(datos);
    return db
      .insert(actividades)
      .values({ ...actividad, clienteId })
      .returning()
      .get();
  }

  static async actualizarActividad(
    clienteId: number,
    id: number,
    datos: Entrada
  ) {
    const existente = await Clientes.actividad(clienteId, id);
    if (existente.completada)
      throw new ErrorServicio(409, "Una actividad completada no se puede editar");
    return db
      .update(actividades)
      .set(validarActividad(datos))
      .where(eq(actividades.id, id))
      .returning()
      .get();
  }

  static async completarActividad(clienteId: number, id: number) {
    await Clientes.actividad(clienteId, id);
    return db
      .update(actividades)
      .set({
        completada: true,
        completadaEn: new Date().toLocaleDateString("en-CA"),
      })
      .where(eq(actividades.id, id))
      .returning()
      .get();
  }

  static async eliminarActividad(clienteId: number, id: number) {
    const existente = await Clientes.actividad(clienteId, id);
    if (existente.completada)
      throw new ErrorServicio(409, "Una actividad completada no se puede eliminar");
    await db.delete(actividades).where(eq(actividades.id, id));
  }
}
