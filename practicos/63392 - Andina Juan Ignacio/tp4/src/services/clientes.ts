import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { actividades, clientes } from "../db/schema";
import type { Cliente } from "../db/schema";

export class ErrorNegocio extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "ErrorNegocio";
  }
}

export interface DatosCliente {
  nombre?: string;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
}

export interface DatosActividad {
  descripcion?: string;
  fecha?: string | null;
}

/** Minúsculas y sin acentos, para comparar de forma flexible. */
function normalizar(valor: unknown): string {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

/**
 * Único módulo de servicio. Toda la lógica de negocio vive acá:
 * búsqueda flexible por cualquier campo y la inmutabilidad de las
 * actividades completadas.
 */
export class Clientes {
  static listar(busqueda?: string): Cliente[] {
    const filas = db.select().from(clientes).orderBy(clientes.nombre).all();
    const termino = normalizar(busqueda).trim();

    if (!termino) return filas;

    return filas.filter((cliente) =>
      normalizar(
        [
          cliente.id,
          cliente.nombre,
          cliente.email,
          cliente.telefono,
          cliente.direccion,
          cliente.ciudad,
        ].join(" "),
      ).includes(termino),
    );
  }

  static obtener(id: number): Cliente {
    const cliente = db.select().from(clientes).where(eq(clientes.id, id)).get();

    if (!cliente) {
      throw new ErrorNegocio("El cliente no existe", 404);
    }

    return cliente;
  }

  static crear(datos: DatosCliente): Cliente {
    return db
      .insert(clientes)
      .values({
        nombre: datos.nombre ?? "",
        email: datos.email ?? null,
        telefono: datos.telefono ?? null,
        direccion: datos.direccion ?? null,
        ciudad: datos.ciudad ?? null,
      })
      .returning()
      .get();
  }

  static actualizar(id: number, datos: DatosCliente): Cliente {
    Clientes.obtener(id);

    const cambios: Partial<DatosCliente> = {};
    if (datos.nombre !== undefined) cambios.nombre = datos.nombre;
    if (datos.email !== undefined) cambios.email = datos.email;
    if (datos.telefono !== undefined) cambios.telefono = datos.telefono;
    if (datos.direccion !== undefined) cambios.direccion = datos.direccion;
    if (datos.ciudad !== undefined) cambios.ciudad = datos.ciudad;

    return db
      .update(clientes)
      .set(cambios)
      .where(eq(clientes.id, id))
      .returning()
      .get();
  }

  static eliminar(id: number): void {
    Clientes.obtener(id);
    db.delete(actividades).where(eq(actividades.clienteId, id)).run();
    db.delete(clientes).where(eq(clientes.id, id)).run();
  }

  static listarActividades(clienteId: number) {
    Clientes.obtener(clienteId);

    return db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, clienteId))
      .orderBy(actividades.completada, actividades.fecha, actividades.id)
      .all();
  }

  static crearActividad(clienteId: number, datos: DatosActividad) {
    Clientes.obtener(clienteId);

    return db
      .insert(actividades)
      .values({
        clienteId,
        descripcion: datos.descripcion ?? "",
        fecha: datos.fecha ?? null,
        completada: false,
        completadaEn: null,
      })
      .returning()
      .get();
  }

  static actualizarActividad(id: number, datos: DatosActividad) {
    const actividad = Clientes.buscarActividad(id);

    if (actividad.completada) {
      throw new ErrorNegocio("Una actividad completada no se puede editar", 409);
    }

    const cambios: Partial<DatosActividad> = {};
    if (datos.descripcion !== undefined) cambios.descripcion = datos.descripcion;
    if (datos.fecha !== undefined) cambios.fecha = datos.fecha;

    return db
      .update(actividades)
      .set(cambios)
      .where(eq(actividades.id, id))
      .returning()
      .get();
  }

  static completarActividad(id: number) {
    const actividad = Clientes.buscarActividad(id);

    if (actividad.completada) {
      throw new ErrorNegocio("La actividad ya está completada", 409);
    }

    return db
      .update(actividades)
      .set({
        completada: true,
        completadaEn: new Date().toISOString().slice(0, 10),
      })
      .where(and(eq(actividades.id, id), eq(actividades.completada, false)))
      .returning()
      .get();
  }

  static eliminarActividad(id: number): void {
    const actividad = Clientes.buscarActividad(id);

    if (actividad.completada) {
      throw new ErrorNegocio("Una actividad completada no se puede eliminar", 409);
    }

    db.delete(actividades).where(eq(actividades.id, id)).run();
  }

  private static buscarActividad(id: number) {
    const actividad = db.select().from(actividades).where(eq(actividades.id, id)).get();

    if (!actividad) {
      throw new ErrorNegocio("La actividad no existe", 404);
    }

    return actividad;
  }
}
