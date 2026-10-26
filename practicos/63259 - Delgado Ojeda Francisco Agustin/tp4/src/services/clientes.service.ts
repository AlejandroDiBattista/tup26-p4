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

export class Clientes {
  static async listar({ buscar }: { buscar?: string } = {}): Promise<ClienteResumen[]> {
    let whereCondition = undefined;

    if (buscar && buscar.trim()) {
      const palabras = buscar.trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (palabras.length > 0) {
        whereCondition = and(
          ...palabras.map((p) => {
            const termino = `%${p}%`;
            return or(
              like(sql`lower(${clientes.nombre})`, termino),
              like(sql`lower(${clientes.email})`, termino),
              like(sql`lower(${clientes.telefono})`, termino),
              like(sql`lower(${clientes.domicilio})`, termino)
            );
          })
        );
      }
    }

    const todosLosClientes = await db
      .select()
      .from(clientes)
      .where(whereCondition)
      .orderBy(asc(clientes.nombre));

    if (todosLosClientes.length === 0) return [];

    const todasLasActividades = await db.select().from(actividades);

    return todosLosClientes.map((c) => {
      const acts = todasLasActividades.filter((a) => a.clienteId === c.id);
      return {
        ...c,
        pendientes: acts.filter((a) => !a.completada).length,
        completadas: acts.filter((a) => a.completada).length,
      };
    });
  }

  static async obtener(id: number): Promise<ClienteDetalle | null> {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id));
    if (!cliente) return null;

    const lista = await db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, id));

    const hoy = new Date().toISOString().split("T")[0];

    const compromisos = lista
      .filter((a) => !a.completada)
      .sort((a, b) => {
        const cat = (act: Actividad) => {
          if (!act.fecha) return 1;
          if (act.fecha < hoy) return 2;
          return 3;
        };
        const catA = cat(a);
        const catB = cat(b);
        if (catA !== catB) return catA - catB;

        if (a.fecha && b.fecha && a.fecha !== b.fecha) {
          return a.fecha.localeCompare(b.fecha);
        }
        return a.id - b.id;
      });

    const completadas = lista
      .filter((a) => a.completada)
      .sort((a, b) => {
        const fA = a.fechaCompletada || a.fecha || "";
        const fB = b.fechaCompletada || b.fecha || "";
        if (fA !== fB) return fB.localeCompare(fA);
        return b.id - a.id;
      });

    return {
      ...cliente,
      actividades: [...compromisos, ...completadas],
      compromisos,
      completadas,
    };
  }

  static async crear(datos: {
    nombre: string;
    email: string;
    telefono?: string;
    domicilio?: string;
  }): Promise<Cliente> {
    if (!datos.nombre?.trim()) throw new Error("El nombre es obligatorio.");
    if (!datos.email?.trim()) throw new Error("El email es obligatorio.");

    const [nuevo] = await db
      .insert(clientes)
      .values({
        nombre: datos.nombre.trim(),
        email: datos.email.trim().toLowerCase(),
        telefono: datos.telefono?.trim() || "",
        domicilio: datos.domicilio?.trim() || "",
      })
      .returning();

    return nuevo;
  }

  static async actualizar(
    id: number,
    datos: { nombre?: string; email?: string; telefono?: string; domicilio?: string }
  ): Promise<Cliente | null> {
    const actualizacion: Partial<NuevoCliente> = {};
    if (datos.nombre !== undefined) {
      if (!datos.nombre.trim()) throw new Error("El nombre no puede estar vacío.");
      actualizacion.nombre = datos.nombre.trim();
    }
    if (datos.email !== undefined) {
      if (!datos.email.trim()) throw new Error("El email no puede estar vacío.");
      actualizacion.email = datos.email.trim().toLowerCase();
    }
    if (datos.telefono !== undefined) actualizacion.telefono = datos.telefono.trim();
    if (datos.domicilio !== undefined) actualizacion.domicilio = datos.domicilio.trim();

    const [actualizado] = await db
      .update(clientes)
      .set(actualizacion)
      .where(eq(clientes.id, id))
      .returning();

    return actualizado ?? null;
  }

  static async eliminar(id: number): Promise<boolean> {
    const [existente] = await db.select().from(clientes).where(eq(clientes.id, id));
    if (!existente) return false;

    await db.delete(clientes).where(eq(clientes.id, id));
    return true;
  }

  static async agregarActividad(
    clienteId: number,
    datos: { descripcion: string; fecha?: string | null }
  ): Promise<Actividad> {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, clienteId));
    if (!cliente) throw new Error("Cliente no encontrado.");
    if (!datos.descripcion?.trim()) throw new Error("La descripción es obligatoria.");

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

  static async actualizarActividad(
    clienteId: number,
    actividadId: number,
    datos: { descripcion?: string; fecha?: string | null }
  ): Promise<Actividad | null> {
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(and(eq(actividades.id, actividadId), eq(actividades.clienteId, clienteId)));

    if (!actividad) return null;
    if (actividad.completada) {
      throw new Error("Las actividades completadas no se pueden editar ni borrar individualmente.");
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

  static async completarActividad(
    clienteId: number,
    actividadId: number
  ): Promise<Actividad | null> {
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(and(eq(actividades.id, actividadId), eq(actividades.clienteId, clienteId)));

    if (!actividad) return null;

    const fechaActual = new Date().toISOString().split("T")[0];
    const [actualizada] = await db
      .update(actividades)
      .set({ completada: true, fechaCompletada: fechaActual })
      .where(eq(actividades.id, actividadId))
      .returning();

    return actualizada ?? null;
  }

  static async eliminarActividad(
    clienteId: number,
    actividadId: number
  ): Promise<boolean> {
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(and(eq(actividades.id, actividadId), eq(actividades.clienteId, clienteId)));

    if (!actividad) return false;
    if (actividad.completada) {
      throw new Error("Las actividades completadas no se pueden editar ni borrar individualmente.");
    }

    await db.delete(actividades).where(eq(actividades.id, actividadId));
    return true;
  }
}
