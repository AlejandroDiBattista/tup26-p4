import { eq, and, asc } from 'drizzle-orm';
import { db, clientes, actividades, type Cliente, type Actividad } from './db.js';

export interface ClienteConActividades extends Cliente {
  actividades: Actividad[];
}

export interface DatosCliente {
  nombre?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface DatosActividad {
  descripcion?: string;
  fecha?: string | null;
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export class Clientes {
  /**
   * Lista clientes. Si se pasa un término de búsqueda, busca de manera flexible
   * e insensible a mayúsculas y acentos por cualquier campo del cliente o de sus actividades.
   */
  static async listar(buscar?: string): Promise<ClienteConActividades[]> {
    const todos = await db.query.clientes.findMany({
      with: { actividades: true },
      orderBy: [asc(clientes.nombre)],
    });

    if (!buscar || !buscar.trim()) {
      return todos;
    }

    const terminos = normalizar(buscar.trim()).split(/\s+/).filter(Boolean);

    return todos.filter((cli) => {
      const actividadesTexto = cli.actividades
        .map((a) => `${a.descripcion} ${a.fecha ?? ''} ${a.fechaCompletada ?? ''}`)
        .join(' ');
      const textoCompleto = normalizar(
        `${cli.id} ${cli.nombre} ${cli.email} ${cli.telefono} ${cli.direccion} ${actividadesTexto}`
      );

      return terminos.every((termino) => textoCompleto.includes(termino));
    });
  }

  /**
   * Obtiene un cliente por ID junto con todas sus actividades.
   */
  static async obtenerPorId(id: number): Promise<ClienteConActividades | null> {
    const cliente = await db.query.clientes.findFirst({
      where: eq(clientes.id, id),
      with: { actividades: true },
    });

    return cliente ?? null;
  }

  /**
   * Crea un nuevo cliente validando que el nombre sea obligatorio.
   */
  static async crear(datos: DatosCliente): Promise<Cliente> {
    const nombre = datos.nombre?.trim();
    if (!nombre) {
      throw new Error('El nombre del cliente es obligatorio');
    }

    const [nuevo] = await db
      .insert(clientes)
      .values({
        nombre,
        email: datos.email?.trim() ?? '',
        telefono: datos.telefono?.trim() ?? '',
        direccion: datos.direccion?.trim() ?? '',
      })
      .returning();

    return nuevo;
  }

  /**
   * Actualiza un cliente existente.
   */
  static async actualizar(id: number, datos: DatosCliente): Promise<Cliente> {
    const existente = await db.query.clientes.findFirst({
      where: eq(clientes.id, id),
    });

    if (!existente) {
      throw new Error(`Cliente con id ${id} no encontrado`);
    }

    if (datos.nombre !== undefined && !datos.nombre.trim()) {
      throw new Error('El nombre del cliente no puede estar vacío');
    }

    const [actualizado] = await db
      .update(clientes)
      .set({
        ...(datos.nombre !== undefined ? { nombre: datos.nombre.trim() } : {}),
        ...(datos.email !== undefined ? { email: datos.email.trim() } : {}),
        ...(datos.telefono !== undefined ? { telefono: datos.telefono.trim() } : {}),
        ...(datos.direccion !== undefined ? { direccion: datos.direccion.trim() } : {}),
      })
      .where(eq(clientes.id, id))
      .returning();

    return actualizado;
  }

  /**
   * Elimina un cliente y sus actividades asociadas (cascada).
   */
  static async eliminar(id: number): Promise<boolean> {
    const existente = await db.query.clientes.findFirst({
      where: eq(clientes.id, id),
    });

    if (!existente) {
      throw new Error(`Cliente con id ${id} no encontrado`);
    }

    await db.delete(clientes).where(eq(clientes.id, id));
    return true;
  }

  // --- Métodos de Actividades del Cliente ---

  /**
   * Agrega una actividad para el cliente indicado.
   */
  static async agregarActividad(clienteId: number, datos: DatosActividad): Promise<Actividad> {
    const cliente = await db.query.clientes.findFirst({
      where: eq(clientes.id, clienteId),
    });

    if (!cliente) {
      throw new Error(`Cliente con id ${clienteId} no encontrado`);
    }

    const descripcion = datos.descripcion?.trim();
    if (!descripcion) {
      throw new Error('La descripción de la actividad es obligatoria');
    }

    const [nueva] = await db
      .insert(actividades)
      .values({
        clienteId,
        descripcion,
        fecha: datos.fecha?.trim() || null,
        completada: false,
        fechaCompletada: null,
      })
      .returning();

    return nueva;
  }

  /**
   * Actualiza una actividad pendiente.
   * Regla de negocio: las actividades completadas no se pueden editar.
   */
  static async actualizarActividad(
    clienteId: number,
    actividadId: number,
    datos: DatosActividad
  ): Promise<Actividad> {
    const actividad = await db.query.actividades.findFirst({
      where: and(eq(actividades.id, actividadId), eq(actividades.clienteId, clienteId)),
    });

    if (!actividad) {
      throw new Error(`Actividad con id ${actividadId} no encontrada para el cliente ${clienteId}`);
    }

    if (actividad.completada) {
      throw new Error('No se pueden editar actividades completadas');
    }

    if (datos.descripcion !== undefined && !datos.descripcion.trim()) {
      throw new Error('La descripción de la actividad no puede estar vacía');
    }

    const [actualizada] = await db
      .update(actividades)
      .set({
        ...(datos.descripcion !== undefined ? { descripcion: datos.descripcion.trim() } : {}),
        ...(datos.fecha !== undefined ? { fecha: datos.fecha?.trim() || null } : {}),
      })
      .where(eq(actividades.id, actividadId))
      .returning();

    return actualizada;
  }

  /**
   * Completa una actividad registrando la fecha actual.
   */
  static async completarActividad(clienteId: number, actividadId: number): Promise<Actividad> {
    const actividad = await db.query.actividades.findFirst({
      where: and(eq(actividades.id, actividadId), eq(actividades.clienteId, clienteId)),
    });

    if (!actividad) {
      throw new Error(`Actividad con id ${actividadId} no encontrada para el cliente ${clienteId}`);
    }

    if (actividad.completada) {
      return actividad;
    }

    const hoy = new Date().toISOString().slice(0, 10);

    const [completada] = await db
      .update(actividades)
      .set({
        completada: true,
        fechaCompletada: hoy,
      })
      .where(eq(actividades.id, actividadId))
      .returning();

    return completada;
  }

  /**
   * Elimina una actividad.
   * Regla de negocio: las actividades completadas no se pueden borrar individualmente.
   */
  static async eliminarActividad(clienteId: number, actividadId: number): Promise<boolean> {
    const actividad = await db.query.actividades.findFirst({
      where: and(eq(actividades.id, actividadId), eq(actividades.clienteId, clienteId)),
    });

    if (!actividad) {
      throw new Error(`Actividad con id ${actividadId} no encontrada para el cliente ${clienteId}`);
    }

    if (actividad.completada) {
      throw new Error('No se pueden borrar individualmente actividades completadas');
    }

    await db.delete(actividades).where(eq(actividades.id, actividadId));
    return true;
  }
}
