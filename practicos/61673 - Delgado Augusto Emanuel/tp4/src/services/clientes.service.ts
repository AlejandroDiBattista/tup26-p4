import { eq, or, like, desc, asc, sql } from 'drizzle-orm';
import { db } from '../db';
import { clientes, actividades, Cliente, NuevoCliente, Actividad, NuevaActividad } from '../db/schema';

export interface ClienteConActividades extends Cliente {
  actividades: Actividad[];
}

export class Clientes {
  /**
   * Obtiene todos los clientes o filtra si se pasa un término de búsqueda
   */
  static async listar(termino?: string): Promise<Cliente[]> {
    if (termino && termino.trim().length > 0) {
      return this.buscar(termino.trim());
    }

    return await db.select().from(clientes).orderBy(asc(clientes.nombre));
  }

  /**
   * Búsqueda flexible por cualquier campo (nombre, email, teléfono, dirección, ciudad)
   */
  static async buscar(criterio: string): Promise<Cliente[]> {
    const patron = `%${criterio}%`;

    return await db
      .select()
      .from(clientes)
      .where(
        or(
          like(clientes.nombre, patron),
          like(clientes.email, patron),
          like(clientes.telefono, patron),
          like(clientes.direccion, patron),
          like(clientes.ciudad, patron)
        )
      )
      .orderBy(asc(clientes.nombre));
  }

  /**
   * Obtiene un cliente por su ID junto con todas sus actividades
   */
  static async obtenerPorId(id: number): Promise<ClienteConActividades | null> {
    const clienteResult = await db
      .select()
      .from(clientes)
      .where(eq(clientes.id, id))
      .limit(1);

    if (clienteResult.length === 0) {
      return null;
    }

    const cliente = clienteResult[0];

    const actividadesCliente = await db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, id))
      .orderBy(asc(actividades.completada), asc(actividades.fecha), desc(actividades.id));

    return {
      ...cliente,
      actividades: actividadesCliente,
    };
  }

  /**
   * Crea un nuevo cliente con validaciones
   */
  static async crear(datos: Omit<NuevoCliente, 'id' | 'createdAt'>): Promise<Cliente> {
    if (!datos.nombre || datos.nombre.trim() === '') {
      throw new Error('El nombre del cliente es obligatorio');
    }

    const nuevo = {
      nombre: datos.nombre.trim(),
      email: datos.email ? datos.email.trim() : null,
      telefono: datos.telefono ? datos.telefono.trim() : null,
      direccion: datos.direccion ? datos.direccion.trim() : null,
      ciudad: datos.ciudad ? datos.ciudad.trim() : null,
    };

    const resultado = await db.insert(clientes).values(nuevo).returning();
    return resultado[0];
  }

  /**
   * Actualiza los datos de un cliente existente
   */
  static async actualizar(
    id: number,
    datos: Partial<Omit<NuevoCliente, 'id' | 'createdAt'>>
  ): Promise<Cliente> {
    const existe = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
    if (existe.length === 0) {
      throw new Error(`Cliente con ID ${id} no encontrado`);
    }

    if (datos.nombre !== undefined && datos.nombre.trim() === '') {
      throw new Error('El nombre del cliente no puede estar vacío');
    }

    const datosActualizados: Partial<NuevoCliente> = {};
    if (datos.nombre !== undefined) datosActualizados.nombre = datos.nombre.trim();
    if (datos.email !== undefined) datosActualizados.email = datos.email?.trim() || null;
    if (datos.telefono !== undefined) datosActualizados.telefono = datos.telefono?.trim() || null;
    if (datos.direccion !== undefined) datosActualizados.direccion = datos.direccion?.trim() || null;
    if (datos.ciudad !== undefined) datosActualizados.ciudad = datos.ciudad?.trim() || null;

    const resultado = await db
      .update(clientes)
      .set(datosActualizados)
      .where(eq(clientes.id, id))
      .returning();

    return resultado[0];
  }

  /**
   * Elimina un cliente y todas sus actividades asociadas (en cascada)
   */
  static async eliminar(id: number): Promise<boolean> {
    const existe = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
    if (existe.length === 0) {
      throw new Error(`Cliente con ID ${id} no encontrado`);
    }

    // Aseguramos eliminación de actividades asociadas
    await db.delete(actividades).where(eq(actividades.clienteId, id));
    await db.delete(clientes).where(eq(clientes.id, id));
    return true;
  }

  // ==========================================
  // Métodos de gestión de Actividades
  // ==========================================

  /**
   * Obtiene las actividades de un cliente
   */
  static async obtenerActividades(clienteId: number): Promise<Actividad[]> {
    return await db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, clienteId))
      .orderBy(asc(actividades.completada), asc(actividades.fecha), desc(actividades.id));
  }

  /**
   * Agrega una actividad a un cliente
   */
  static async agregarActividad(
    clienteId: number,
    datos: { descripcion: string; fecha?: string | null }
  ): Promise<Actividad> {
    const cliente = await db.select().from(clientes).where(eq(clientes.id, clienteId)).limit(1);
    if (cliente.length === 0) {
      throw new Error(`Cliente con ID ${clienteId} no existe`);
    }

    if (!datos.descripcion || datos.descripcion.trim() === '') {
      throw new Error('La descripción de la actividad es obligatoria');
    }

    const nueva = {
      clienteId,
      descripcion: datos.descripcion.trim(),
      fecha: datos.fecha ? datos.fecha.trim() : null,
      completada: 0,
      fechaCompletada: null,
    };

    const resultado = await db.insert(actividades).values(nueva).returning();
    return resultado[0];
  }

  /**
   * Actualiza una actividad no completada
   * REGLA DE NEGOCIO: Las actividades completadas no se pueden editar.
   */
  static async actualizarActividad(
    actividadId: number,
    datos: { descripcion?: string; fecha?: string | null }
  ): Promise<Actividad> {
    const actividad = await db
      .select()
      .from(actividades)
      .where(eq(actividades.id, actividadId))
      .limit(1);

    if (actividad.length === 0) {
      throw new Error(`Actividad con ID ${actividadId} no encontrada`);
    }

    if (actividad[0].completada === 1) {
      throw new Error('Las actividades completadas no se pueden editar ni borrar individualmente');
    }

    const camposActualizar: Partial<Actividad> = {};
    if (datos.descripcion !== undefined) {
      if (datos.descripcion.trim() === '') {
        throw new Error('La descripción no puede estar vacía');
      }
      camposActualizar.descripcion = datos.descripcion.trim();
    }
    if (datos.fecha !== undefined) {
      camposActualizar.fecha = datos.fecha ? datos.fecha.trim() : null;
    }

    const resultado = await db
      .update(actividades)
      .set(camposActualizar)
      .where(eq(actividades.id, actividadId))
      .returning();

    return resultado[0];
  }

  /**
   * Marca una actividad como completada
   */
  static async completarActividad(actividadId: number): Promise<Actividad> {
    const actividad = await db
      .select()
      .from(actividades)
      .where(eq(actividades.id, actividadId))
      .limit(1);

    if (actividad.length === 0) {
      throw new Error(`Actividad con ID ${actividadId} no encontrada`);
    }

    const hoy = new Date();
    const fechaFormateada = hoy.toISOString().split('T')[0];

    const resultado = await db
      .update(actividades)
      .set({
        completada: 1,
        fechaCompletada: fechaFormateada,
      })
      .where(eq(actividades.id, actividadId))
      .returning();

    return resultado[0];
  }

  /**
   * Elimina una actividad individual
   * REGLA DE NEGOCIO: Las actividades completadas no se pueden borrar individualmente.
   */
  static async eliminarActividad(actividadId: number): Promise<boolean> {
    const actividad = await db
      .select()
      .from(actividades)
      .where(eq(actividades.id, actividadId))
      .limit(1);

    if (actividad.length === 0) {
      throw new Error(`Actividad con ID ${actividadId} no encontrada`);
    }

    if (actividad[0].completada === 1) {
      throw new Error('Las actividades completadas no se pueden editar ni borrar individualmente');
    }

    await db.delete(actividades).where(eq(actividades.id, actividadId));
    return true;
  }
}
