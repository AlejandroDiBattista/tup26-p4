import { and, asc, eq, like, or, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { actividades, clientes, type Actividad, type Cliente, type NuevoCliente } from "../db/schema.js";

export class Clientes {
  // Búsqueda flexible por cualquier campo de texto o ID
  static async buscar(termino = ""): Promise<Cliente[]> {
    const busqueda = termino.trim();

    if (!busqueda) {
      return db
        .select()
        .from(clientes)
        .orderBy(asc(clientes.apellido), asc(clientes.nombre));
    }

    const patron = `%${busqueda}%`;

    return db
      .select()
      .from(clientes)
      .where(
        or(
          like(clientes.nombre, patron),
          like(clientes.apellido, patron),
          like(clientes.email, patron),
          like(clientes.domicilio, patron),
          like(clientes.localidad, patron),
          like(clientes.telefono, patron),
          like(sql`cast(${clientes.id} as text)`, patron)
        )
      )
      .orderBy(asc(clientes.apellido), asc(clientes.nombre));
  }

  // Obtener cliente por ID
  static async obtenerPorId(id: number): Promise<Cliente | null> {
    const [cliente] = await db
      .select()
      .from(clientes)
      .where(eq(clientes.id, id));

    return cliente ?? null;
  }

  // Crear un nuevo cliente
  static async crear(datos: Omit<NuevoCliente, "id">): Promise<Cliente> {
    if (!datos.nombre?.trim()) throw new Error("El nombre es obligatorio");
    if (!datos.apellido?.trim()) throw new Error("El apellido es obligatorio");
    if (!datos.email?.trim()) throw new Error("El email es obligatorio");

    const emailNormalizado = datos.email.trim().toLowerCase();

    // Comprobar si ya existe un cliente con ese email
    const [existente] = await db
      .select()
      .from(clientes)
      .where(eq(clientes.email, emailNormalizado));

    if (existente) {
      throw new Error("Ya existe un cliente con ese email");
    }

    const nuevo = {
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      email: emailNormalizado,
      domicilio: datos.domicilio?.trim() || null,
      localidad: datos.localidad?.trim() || null,
      telefono: datos.telefono?.trim() || null,
    };

    const [cliente] = await db.insert(clientes).values(nuevo).returning();
    return cliente;
  }

  // Actualizar datos de un cliente
  static async actualizar(id: number, datos: Partial<Omit<NuevoCliente, "id">>): Promise<Cliente> {
    const actual = await this.obtenerPorId(id);
    if (!actual) throw new Error("Cliente no encontrado");

    if (datos.email) {
      const emailNormalizado = datos.email.trim().toLowerCase();
      const [existente] = await db
        .select()
        .from(clientes)
        .where(eq(clientes.email, emailNormalizado));

      if (existente && existente.id !== id) {
        throw new Error("Ya existe otro cliente con ese email");
      }
    }

    const camposActualizar: Partial<Omit<NuevoCliente, "id">> = {};
    if (datos.nombre !== undefined) camposActualizar.nombre = datos.nombre.trim();
    if (datos.apellido !== undefined) camposActualizar.apellido = datos.apellido.trim();
    if (datos.email !== undefined) camposActualizar.email = datos.email.trim().toLowerCase();
    if (datos.domicilio !== undefined) camposActualizar.domicilio = datos.domicilio?.trim() || null;
    if (datos.localidad !== undefined) camposActualizar.localidad = datos.localidad?.trim() || null;
    if (datos.telefono !== undefined) camposActualizar.telefono = datos.telefono?.trim() || null;

    const [actualizado] = await db
      .update(clientes)
      .set(camposActualizar)
      .where(eq(clientes.id, id))
      .returning();

    return actualizado;
  }

  // Eliminar cliente (sus actividades se eliminan en cascada)
  static async eliminar(id: number): Promise<boolean> {
    const actual = await this.obtenerPorId(id);
    if (!actual) throw new Error("Cliente no encontrado");

    await db.delete(clientes).where(eq(clientes.id, id));
    return true;
  }

  // ---------- Actividades ----------

  // Listar actividades de un cliente
  static async listarActividades(clienteId: number): Promise<Actividad[]> {
    return db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, clienteId))
      .orderBy(asc(actividades.fechaFinalizacion), asc(actividades.fechaCompromiso));
  }

  // Crear una actividad para un cliente
  static async crearActividad(
    clienteId: number,
    datos: { descripcion: string; fechaCompromiso?: string | null }
  ): Promise<Actividad> {
    const cliente = await this.obtenerPorId(clienteId);
    if (!cliente) throw new Error("Cliente no encontrado");

    if (!datos.descripcion?.trim()) {
      throw new Error("La descripción de la actividad es obligatoria");
    }

    const [actividad] = await db
      .insert(actividades)
      .values({
        clienteId,
        descripcion: datos.descripcion.trim(),
        fechaCompromiso: datos.fechaCompromiso?.trim() || null,
        fechaFinalizacion: null,
      })
      .returning();

    return actividad;
  }

  // Actualizar una actividad pendiente
  static async actualizarActividad(
    id: number,
    datos: { descripcion?: string; fechaCompromiso?: string | null }
  ): Promise<Actividad> {
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(eq(actividades.id, id));

    if (!actividad) throw new Error("Actividad no encontrada");

    // Regla de negocio: Las actividades completadas no se pueden editar ni borrar individualmente
    if (actividad.fechaFinalizacion) {
      throw new Error("Las actividades completadas no se pueden editar ni borrar individualmente");
    }

    const camposActualizar: { descripcion?: string; fechaCompromiso?: string | null } = {};
    if (datos.descripcion !== undefined) {
      if (!datos.descripcion.trim()) throw new Error("La descripción no puede estar vacía");
      camposActualizar.descripcion = datos.descripcion.trim();
    }
    if (datos.fechaCompromiso !== undefined) {
      camposActualizar.fechaCompromiso = datos.fechaCompromiso?.trim() || null;
    }

    const [actualizada] = await db
      .update(actividades)
      .set(camposActualizar)
      .where(eq(actividades.id, id))
      .returning();

    return actualizada;
  }

  // Completar una actividad
  static async completarActividad(id: number): Promise<Actividad> {
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(eq(actividades.id, id));

    if (!actividad) throw new Error("Actividad no encontrada");

    const hoy = new Date().toISOString().split("T")[0];

    const [completada] = await db
      .update(actividades)
      .set({ fechaFinalizacion: hoy })
      .where(eq(actividades.id, id))
      .returning();

    return completada;
  }

  // Eliminar una actividad pendiente
  static async eliminarActividad(id: number): Promise<boolean> {
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(eq(actividades.id, id));

    if (!actividad) throw new Error("Actividad no encontrada");

    // Regla de negocio: Las actividades completadas no se pueden editar ni borrar individualmente
    if (actividad.fechaFinalizacion) {
      throw new Error("Las actividades completadas no se pueden editar ni borrar individualmente");
    }

    await db.delete(actividades).where(eq(actividades.id, id));
    return true;
  }
}
