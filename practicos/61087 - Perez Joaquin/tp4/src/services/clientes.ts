import { asc, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { actividades, clientes } from "../db/schema.js";

export type DatosCliente = {
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
};

export type DatosActividad = {
  descripcion: string;
  fecha?: string | null;
};

export class ErrorDeNegocio extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
  }
}

const textoObligatorio = (valor: string | undefined, campo: string) => {
  const texto = valor?.trim();
  if (!texto) throw new ErrorDeNegocio(`${campo} es obligatorio.`);
  return texto;
};

const normalizarCliente = (datos: DatosCliente) => ({
  nombre: textoObligatorio(datos.nombre, "El nombre"),
  email: textoObligatorio(datos.email, "El email").toLowerCase(),
  telefono: datos.telefono?.trim() ?? "",
  direccion: datos.direccion?.trim() ?? "",
  ciudad: datos.ciudad?.trim() ?? "",
});

export class Clientes {
  static async listar(busqueda = "") {
    const termino = busqueda.trim();
    const condicion = termino
      ? or(
          like(clientes.nombre, `%${termino}%`),
          like(clientes.email, `%${termino}%`),
          like(clientes.telefono, `%${termino}%`),
          like(clientes.direccion, `%${termino}%`),
          like(clientes.ciudad, `%${termino}%`),
          sql`cast(${clientes.id} as text) like ${`%${termino}%`}`,
        )
      : undefined;

    return db.select().from(clientes).where(condicion).orderBy(asc(clientes.nombre));
  }

  static async obtener(id: number) {
    const cliente = await db.query.clientes.findFirst({ where: eq(clientes.id, id) });
    if (!cliente) throw new ErrorDeNegocio("Cliente no encontrado.", 404);

    const actividadesDelCliente = await db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, id))
      .orderBy(asc(actividades.completada), asc(actividades.fecha), desc(actividades.id));

    return { ...cliente, actividades: actividadesDelCliente };
  }

  static async crear(datos: DatosCliente) {
    const [cliente] = await db.insert(clientes).values(normalizarCliente(datos)).returning();
    return cliente;
  }

  static async editar(id: number, datos: DatosCliente) {
    await this.obtener(id);
    const [cliente] = await db
      .update(clientes)
      .set(normalizarCliente(datos))
      .where(eq(clientes.id, id))
      .returning();
    return cliente;
  }

  static async eliminar(id: number) {
    await this.obtener(id);
    await db.delete(clientes).where(eq(clientes.id, id));
  }

  static async agregarActividad(clienteId: number, datos: DatosActividad) {
    await this.obtener(clienteId);
    const [actividad] = await db
      .insert(actividades)
      .values({
        clienteId,
        descripcion: textoObligatorio(datos.descripcion, "La descripción"),
        fecha: datos.fecha || null,
      })
      .returning();
    return actividad;
  }

  static async editarActividad(id: number, datos: DatosActividad) {
    const actividad = await db.query.actividades.findFirst({ where: eq(actividades.id, id) });
    if (!actividad) throw new ErrorDeNegocio("Actividad no encontrada.", 404);
    if (actividad.completada) {
      throw new ErrorDeNegocio("Las actividades completadas no se pueden editar.", 409);
    }
    const [actualizada] = await db
      .update(actividades)
      .set({ descripcion: textoObligatorio(datos.descripcion, "La descripción"), fecha: datos.fecha || null })
      .where(eq(actividades.id, id))
      .returning();
    return actualizada;
  }

  static async completarActividad(id: number) {
    const actividad = await db.query.actividades.findFirst({ where: eq(actividades.id, id) });
    if (!actividad) throw new ErrorDeNegocio("Actividad no encontrada.", 404);
    const [actualizada] = await db
      .update(actividades)
      .set({ completada: true, completadaEn: new Date().toISOString() })
      .where(eq(actividades.id, id))
      .returning();
    return actualizada;
  }

  static async eliminarActividad(id: number) {
    const actividad = await db.query.actividades.findFirst({ where: eq(actividades.id, id) });
    if (!actividad) throw new ErrorDeNegocio("Actividad no encontrada.", 404);
    if (actividad.completada) {
      throw new ErrorDeNegocio("Las actividades completadas no se pueden eliminar.", 409);
    }
    await db.delete(actividades).where(eq(actividades.id, id));
  }
}
