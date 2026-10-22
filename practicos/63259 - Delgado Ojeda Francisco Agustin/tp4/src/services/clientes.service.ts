import { db } from "../db/index.js";
import {
  clientes,
  actividades,
  Cliente,
  Actividad,
  NuevoCliente,
  NuevaActividad,
} from "../db/schema.js";
import { eq, and, or, like, desc, asc, sql } from "drizzle-orm";

export interface ClienteResumen extends Cliente {
  pendientes: number;
  completadas: number;
}

export interface ClienteDetalle extends Cliente {
  actividades: Actividad[];
  compromisos: Actividad[];
  completadas: Actividad[];
}

export interface FiltroClientes {
  buscar?: string;
}

export class Clientes {
  /**
   * Listado de clientes con conteo de actividades pendientes y completadas.
   * Soporta búsqueda flexible por cualquier campo (nombre, email, teléfono, domicilio).
   */
  static async listar({ buscar }: FiltroClientes = {}): Promise<ClienteResumen[]> {
    let whereCondition = undefined;

    if (buscar && buscar.trim()) {
      const palabras = buscar.trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (palabras.length > 0) {
        const condiciones = palabras.map((p) => {
          const termino = `%${p}%`;
          return or(
            like(sql`lower(${clientes.nombre})`, termino),
            like(sql`lower(${clientes.email})`, termino),
            like(sql`lower(${clientes.telefono})`, termino),
            like(sql`lower(${clientes.domicilio})`, termino)
          );
        });
        whereCondition = and(...condiciones);
      }
    }

    const todosLosClientes = await db
      .select()
      .from(clientes)
      .where(whereCondition)
      .orderBy(asc(clientes.nombre));

    if (todosLosClientes.length === 0) {
      return [];
    }

    const todasLasActividades = await db.select().from(actividades);

    return todosLosClientes.map((c) => {
      const acts = todasLasActividades.filter((a) => a.clienteId === c.id);
      const pendientes = acts.filter((a) => !a.completada).length;
      const completadas = acts.filter((a) => a.completada).length;
      return {
        ...c,
        pendientes,
        completadas,
      };
    });
  }

  /**
   * Obtiene la ficha completa de un cliente junto a sus actividades (compromisos y completadas).
   */
  static async obtener(id: number): Promise<ClienteDetalle | null> {
    const [cliente] = await db
      .select()
      .from(clientes)
      .where(eq(clientes.id, id));

    if (!cliente) return null;

    const listaActividades = await db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, id))
      .orderBy(desc(actividades.id));

    const compromisos = listaActividades.filter((a) => !a.completada);
    const completadas = listaActividades.filter((a) => a.completada);

    return {
      ...cliente,
      actividades: listaActividades,
      compromisos,
      completadas,
    };
  }

  /**
   * Crea un nuevo cliente con sus datos de contacto.
   */
  static async crear(datos: {
    nombre: string;
    email: string;
    telefono?: string;
    domicilio?: string;
  }): Promise<Cliente> {
    if (!datos.nombre?.trim()) {
      throw new Error("El nombre del cliente es obligatorio.");
    }
    if (!datos.email?.trim()) {
      throw new Error("El email del cliente es obligatorio.");
    }

    const [nuevo] = await db
      .insert(clientes)
      .values({
        nombre: datos.nombre.trim(),
        email: datos.email.trim(),
        telefono: datos.telefono?.trim() || "",
        domicilio: datos.domicilio?.trim() || "",
      })
      .returning();

    return nuevo;
  }

  /**
   * Actualiza los datos personales y de contacto de un cliente.
   */
  static async actualizar(
    id: number,
    datos: {
      nombre?: string;
      email?: string;
      telefono?: string;
      domicilio?: string;
    }
  ): Promise<Cliente | null> {
    const [existente] = await db
      .select()
      .from(clientes)
      .where(eq(clientes.id, id));

    if (!existente) return null;

    const actualizacion: Partial<NuevoCliente> = {};
    if (datos.nombre !== undefined) {
      if (!datos.nombre.trim()) throw new Error("El nombre no puede estar vacío.");
      actualizacion.nombre = datos.nombre.trim();
    }
    if (datos.email !== undefined) {
      if (!datos.email.trim()) throw new Error("El email no puede estar vacío.");
      actualizacion.email = datos.email.trim();
    }
    if (datos.telefono !== undefined) {
      actualizacion.telefono = datos.telefono.trim();
    }
    if (datos.domicilio !== undefined) {
      actualizacion.domicilio = datos.domicilio.trim();
    }

    const [actualizado] = await db
      .update(clientes)
      .set(actualizacion)
      .where(eq(clientes.id, id))
      .returning();

    return actualizado ?? null;
  }

  /**
   * Elimina un cliente y todas sus actividades asociadas (en cascada).
   */
  static async eliminar(id: number): Promise<boolean> {
    const [existente] = await db
      .select()
      .from(clientes)
      .where(eq(clientes.id, id));

    if (!existente) return false;

    await db.delete(clientes).where(eq(clientes.id, id));
    return true;
  }

  // --- Operaciones sobre actividades del cliente ---

  /**
   * Agrega una actividad para un cliente.
   */
  static async agregarActividad(
    clienteId: number,
    datos: { descripcion: string; fecha?: string | null }
  ): Promise<Actividad> {
    const [cliente] = await db
      .select()
      .from(clientes)
      .where(eq(clientes.id, clienteId));

    if (!cliente) {
      throw new Error(`Cliente con id ${clienteId} no encontrado.`);
    }

    if (!datos.descripcion?.trim()) {
      throw new Error("La descripción de la actividad es obligatoria.");
    }

    const [nueva] = await db
      .insert(actividades)
      .values({
        clienteId,
        descripcion: datos.descripcion.trim(),
        fecha: datos.fecha?.trim() || null,
        completada: false,
      })
      .returning();

    return nueva;
  }

  /**
   * Actualiza una actividad de un cliente.
   * Regla de negocio: las actividades completadas NO se pueden editar.
   */
  static async actualizarActividad(
    clienteId: number,
    actividadId: number,
    datos: { descripcion?: string; fecha?: string | null }
  ): Promise<Actividad | null> {
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(
        and(
          eq(actividades.id, actividadId),
          eq(actividades.clienteId, clienteId)
        )
      );

    if (!actividad) return null;

    if (actividad.completada) {
      throw new Error(
        "Las actividades completadas no se pueden editar ni borrar individualmente."
      );
    }

    const actualizacion: Partial<NuevaActividad> = {};
    if (datos.descripcion !== undefined) {
      if (!datos.descripcion.trim()) throw new Error("La descripción no puede estar vacía.");
      actualizacion.descripcion = datos.descripcion.trim();
    }
    if (datos.fecha !== undefined) {
      actualizacion.fecha = datos.fecha ? datos.fecha.trim() : null;
    }

    const [actualizada] = await db
      .update(actividades)
      .set(actualizacion)
      .where(eq(actividades.id, actividadId))
      .returning();

    return actualizada ?? null;
  }

  /**
   * Marca una actividad como completada con la fecha actual.
   */
  static async completarActividad(
    clienteId: number,
    actividadId: number
  ): Promise<Actividad | null> {
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(
        and(
          eq(actividades.id, actividadId),
          eq(actividades.clienteId, clienteId)
        )
      );

    if (!actividad) return null;

    const hoy = new Date();
    const fechaActual = hoy.toISOString().split("T")[0];

    const [actualizada] = await db
      .update(actividades)
      .set({
        completada: true,
        fechaCompletada: fechaActual,
      })
      .where(eq(actividades.id, actividadId))
      .returning();

    return actualizada ?? null;
  }

  /**
   * Elimina una actividad.
   * Regla de negocio: las actividades completadas NO se pueden borrar individualmente.
   */
  static async eliminarActividad(
    clienteId: number,
    actividadId: number
  ): Promise<boolean> {
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(
        and(
          eq(actividades.id, actividadId),
          eq(actividades.clienteId, clienteId)
        )
      );

    if (!actividad) return false;

    if (actividad.completada) {
      throw new Error(
        "Las actividades completadas no se pueden editar ni borrar individualmente."
      );
    }

    await db.delete(actividades).where(eq(actividades.id, actividadId));
    return true;
  }
}
