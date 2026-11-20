import { eq, like, or } from "drizzle-orm";
import { db } from "../db/index.ts";
import { actividades, clientes, type NuevoCliente } from "../db/schema.ts";

function hoy() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function normalizar(datos: Partial<NuevoCliente>) {
  const t = (s?: string | null) => s?.trim() || null;
  return {
    ...datos,
    nombre: datos.nombre?.trim(),
    apellido: datos.apellido?.trim(),
    email: datos.email?.trim().toLowerCase(),
    telefono: t(datos.telefono)?.replace(/\s+/g, " "),
    domicilio: t(datos.domicilio),
    localidad: t(datos.localidad),
  };
}

export class Clientes {
  static listar(texto = "") {
    const q = `%${texto.trim()}%`;
    const filtro = texto.trim()
      ? or(
          like(clientes.nombre, q),
          like(clientes.apellido, q),
          like(clientes.email, q),
          like(clientes.domicilio, q),
          like(clientes.localidad, q),
          like(clientes.telefono, q),
        )
      : undefined;

    return db.select().from(clientes).where(filtro);
  }

  static async obtener(id: number) {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id));
    if (!cliente) return null;
    const lista = await db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, id));
    return { ...cliente, actividades: lista };
  }

  static async crear(datos: NuevoCliente) {
    const [fila] = await db
      .insert(clientes)
      .values(normalizar(datos) as NuevoCliente)
      .returning();
    return fila;
  }

  static async actualizar(id: number, datos: Partial<NuevoCliente>) {
    const [fila] = await db
      .update(clientes)
      .set(normalizar(datos))
      .where(eq(clientes.id, id))
      .returning();
    return fila ?? null;
  }

  static async eliminar(id: number) {
    const borrados = await db.delete(clientes).where(eq(clientes.id, id)).returning();
    return borrados.length === 1;
  }

  static async agregarActividad(
    clienteId: number,
    datos: { descripcion: string; fechaCompromiso?: string | null },
  ) {
    const cliente = await Clientes.obtener(clienteId);
    if (!cliente) {
      throw Object.assign(new Error("Cliente inexistente"), { status: 404 });
    }
    const [fila] = await db
      .insert(actividades)
      .values({
        clienteId,
        descripcion: datos.descripcion.trim(),
        fechaCompromiso: datos.fechaCompromiso || null,
      })
      .returning();
    return fila;
  }

  static async editarActividad(
    id: number,
    datos: { descripcion: string; fechaCompromiso?: string | null },
  ) {
    await Clientes.#pedirPendiente(id);
    const [fila] = await db
      .update(actividades)
      .set({
        descripcion: datos.descripcion.trim(),
        fechaCompromiso: datos.fechaCompromiso || null,
      })
      .where(eq(actividades.id, id))
      .returning();
    return fila;
  }

  static async completarActividad(id: number) {
    await Clientes.#pedirPendiente(id);
    const [fila] = await db
      .update(actividades)
      .set({ fechaFinalizacion: hoy() })
      .where(eq(actividades.id, id))
      .returning();
    return fila;
  }

  static async borrarActividad(id: number) {
    await Clientes.#pedirPendiente(id);
    await db.delete(actividades).where(eq(actividades.id, id));
  }

  static async #pedirPendiente(id: number) {
    const [fila] = await db.select().from(actividades).where(eq(actividades.id, id));
    if (!fila) {
      throw Object.assign(new Error("Actividad inexistente"), { status: 404 });
    }
    if (fila.fechaFinalizacion) {
      throw Object.assign(
        new Error("Las completadas no se editan ni se borran"),
        { status: 409 },
      );
    }
    return fila;
  }
}
