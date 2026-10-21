import { eq, like, or, type SQL } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  actividades,
  clientes,
  type Cliente,
  type NuevaActividad,
  type NuevoCliente,
  type Actividad,
} from "../db/schema.js";

function ahora(): string {
  return new Date().toISOString();
}

export class Clientes {
  static async listar(busqueda?: string): Promise<Cliente[]> {
    if (!busqueda || busqueda.trim() === "") {
      return db.select().from(clientes).orderBy(clientes.nombre).all();
    }
    return this.buscar(busqueda);
  }

  static async buscar(texto: string): Promise<Cliente[]> {
    const patron = `%${texto.trim()}%`;
    const condiciones: SQL[] = [
      like(clientes.nombre, patron),
      like(clientes.email, patron),
      like(clientes.telefono, patron),
      like(clientes.empresa, patron),
      like(clientes.notas, patron),
    ];
    return db
      .select()
      .from(clientes)
      .where(or(...condiciones))
      .orderBy(clientes.nombre)
      .all();
  }

  static async obtener(id: number): Promise<Cliente | undefined> {
    return db.select().from(clientes).where(eq(clientes.id, id)).get();
  }

  static async crear(datos: NuevoCliente): Promise<Cliente> {
    const fila = {
      nombre: datos.nombre,
      email: datos.email,
      telefono: datos.telefono ?? "",
      empresa: datos.empresa ?? "",
      notas: datos.notas ?? "",
      creadoEn: ahora(),
    };
    return db.insert(clientes).values(fila).returning().get();
  }

  static async editar(
    id: number,
    datos: Partial<NuevoCliente>
  ): Promise<Cliente | undefined> {
    if (!(await this.obtener(id))) return undefined;
    return db
      .update(clientes)
      .set(datos)
      .where(eq(clientes.id, id))
      .returning()
      .get();
  }

  static async eliminar(id: number): Promise<boolean> {
    const resultado = await db.delete(clientes).where(eq(clientes.id, id));
    return resultado.rowsAffected > 0;
  }

  static async actividades(clienteId: number): Promise<Actividad[]> {
    return db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, clienteId))
      .orderBy(actividades.completada, actividades.vencimiento)
      .all();
  }

  static async agregarActividad(
    clienteId: number,
    datos: Omit<NuevaActividad, "clienteId" | "creadoEn">
  ): Promise<Actividad | undefined> {
    if (!(await this.obtener(clienteId))) return undefined;
    const fila = {
      clienteId,
      descripcion: datos.descripcion,
      vencimiento: datos.vencimiento ?? "",
      completada: datos.completada ?? false,
      creadoEn: ahora(),
    };
    return db.insert(actividades).values(fila).returning().get();
  }

  static async editarActividad(
    id: number,
    datos: Partial<NuevaActividad>
  ): Promise<Actividad | undefined> {
    const actual = await db
      .select()
      .from(actividades)
      .where(eq(actividades.id, id))
      .get();
    if (!actual || actual.completada) return undefined;
    return db
      .update(actividades)
      .set(datos)
      .where(eq(actividades.id, id))
      .returning()
      .get();
  }

  static async completarActividad(id: number): Promise<Actividad | undefined> {
    const actual = await db
      .select()
      .from(actividades)
      .where(eq(actividades.id, id))
      .get();
    if (!actual) return undefined;
    return db
      .update(actividades)
      .set({ completada: true })
      .where(eq(actividades.id, id))
      .returning()
      .get();
  }

  static async eliminarActividad(id: number): Promise<boolean> {
    const actual = await db
      .select()
      .from(actividades)
      .where(eq(actividades.id, id))
      .get();
    if (!actual || actual.completada) return false;
    const resultado = await db
      .delete(actividades)
      .where(eq(actividades.id, id));
    return resultado.rowsAffected > 0;
  }
}

export type { Cliente, Actividad };
