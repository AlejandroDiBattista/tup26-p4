import { eq, or, like, desc, asc } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { clientes, actividades, type Cliente, type NuevoCliente, type Actividad, type NuevaActividad } from '../db/schema.js';

export interface ActividadConEstado extends Actividad {
  estaCompletada: boolean;
  estaVencida: boolean;
}

export interface ClienteConActividades extends Cliente {
  actividades: ActividadConEstado[];
}

export class Clientes {
  /**
   * Normaliza texto para búsqueda sin tildes ni mayúsculas
   */
  private static normalizarTexto(texto: string | null | undefined): string {
    if (!texto) return '';
    return texto
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  /**
   * Normaliza datos de un cliente antes de guardar o actualizar
   */
  private static normalizarCliente(datos: Partial<NuevoCliente>): Partial<NuevoCliente> {
    const normalizado: Partial<NuevoCliente> = { ...datos };

    if (normalizado.nombre) {
      normalizado.nombre = normalizado.nombre
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }

    if (normalizado.apellido) {
      normalizado.apellido = normalizado.apellido
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }

    if (normalizado.email) {
      normalizado.email = normalizado.email.trim().toLowerCase();
    }

    if (normalizado.telefono) {
      normalizado.telefono = normalizado.telefono.trim();
    }

    if (normalizado.domicilio) {
      normalizado.domicilio = normalizado.domicilio.trim();
    }

    if (normalizado.localidad) {
      normalizado.localidad = normalizado.localidad.trim();
    }

    return normalizado;
  }

  /**
   * Ordena las actividades según la especificación:
   * 1) Compromisos (pendientes): primero sin fecha, luego vencidos, luego fecha actual/futura ascendente.
   * 2) Completadas: por fecha de finalización descendente.
   */
  public static ordenarActividades(lista: Actividad[]): ActividadConEstado[] {
    const hoyStr = new Date().toISOString().split('T')[0];

    const enriquecidas: ActividadConEstado[] = lista.map((act) => {
      const estaCompletada = Boolean(act.fechaFinalizacion && act.fechaFinalizacion.trim() !== '');
      const estaVencida =
        !estaCompletada &&
        Boolean(act.fechaCompromiso && act.fechaCompromiso.trim() !== '' && act.fechaCompromiso < hoyStr);

      return {
        ...act,
        estaCompletada,
        estaVencida,
      };
    });

    // Separamos compromisos y completadas
    const compromisos = enriquecidas.filter((a) => !a.estaCompletada);
    const completadas = enriquecidas.filter((a) => a.estaCompletada);

    // Ordenar compromisos:
    // 1. Sin fecha primero
    // 2. Vencidos
    // 3. Con fecha actual/futura (ascendente por fecha)
    compromisos.sort((a, b) => {
      const aSinFecha = !a.fechaCompromiso || a.fechaCompromiso.trim() === '';
      const bSinFecha = !b.fechaCompromiso || b.fechaCompromiso.trim() === '';

      if (aSinFecha && !bSinFecha) return -1;
      if (!aSinFecha && bSinFecha) return 1;
      if (aSinFecha && bSinFecha) return a.id - b.id;

      if (a.estaVencida && !b.estaVencida) return -1;
      if (!a.estaVencida && b.estaVencida) return 1;

      // Ambos vencidos o ambos futuros: orden ascendente por fecha
      const cmpFecha = (a.fechaCompromiso || '').localeCompare(b.fechaCompromiso || '');
      if (cmpFecha !== 0) return cmpFecha;
      return a.id - b.id;
    });

    // Completadas: por fecha de finalización descendente
    completadas.sort((a, b) => {
      const cmp = (b.fechaFinalizacion || '').localeCompare(a.fechaFinalizacion || '');
      if (cmp !== 0) return cmp;
      return b.id - a.id;
    });

    return [...compromisos, ...completadas];
  }

  /**
   * Búsqueda flexible de clientes por cualquier campo
   */
  public static async listar(criterio?: string): Promise<Cliente[]> {
    const todos = await db.select().from(clientes).orderBy(asc(clientes.apellido), asc(clientes.nombre));

    if (!criterio || criterio.trim() === '') {
      return todos;
    }

    const termino = this.normalizarTexto(criterio);

    return todos.filter((cli) => {
      const datosConcatenados = this.normalizarTexto(
        `${cli.id} ${cli.nombre} ${cli.apellido} ${cli.email} ${cli.telefono || ''} ${cli.domicilio || ''} ${cli.localidad || ''}`
      );
      return datosConcatenados.includes(termino);
    });
  }

  /**
   * Obtiene un cliente por su ID junto con sus actividades enriquecidas
   */
  public static async obtenerPorId(id: number): Promise<ClienteConActividades | null> {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id));
    if (!cliente) return null;

    const listaActividades = await db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, id));

    return {
      ...cliente,
      actividades: this.ordenarActividades(listaActividades),
    };
  }

  /**
   * Crea un nuevo cliente normalizando sus datos
   */
  public static async crear(datos: NuevoCliente): Promise<Cliente> {
    if (!datos.nombre || !datos.apellido || !datos.email) {
      throw new Error('Nombre, apellido y email son campos requeridos.');
    }

    const normalizado = this.normalizarCliente(datos) as NuevoCliente;
    const [nuevo] = await db.insert(clientes).values(normalizado).returning();
    return nuevo;
  }

  /**
   * Actualiza un cliente existente
   */
  public static async actualizar(id: number, datos: Partial<NuevoCliente>): Promise<Cliente | null> {
    const [existente] = await db.select().from(clientes).where(eq(clientes.id, id));
    if (!existente) return null;

    const normalizado = this.normalizarCliente(datos);
    const [actualizado] = await db
      .update(clientes)
      .set(normalizado)
      .where(eq(clientes.id, id))
      .returning();

    return actualizado;
  }

  /**
   * Elimina un cliente y sus actividades asociadas (en cascada)
   */
  public static async eliminar(id: number): Promise<boolean> {
    const [existente] = await db.select().from(clientes).where(eq(clientes.id, id));
    if (!existente) return false;

    await db.delete(actividades).where(eq(actividades.clienteId, id));
    await db.delete(clientes).where(eq(clientes.id, id));
    return true;
  }

  /**
   * Lista actividades de un cliente
   */
  public static async listarActividades(clienteId: number): Promise<ActividadConEstado[]> {
    const lista = await db.select().from(actividades).where(eq(actividades.clienteId, clienteId));
    return this.ordenarActividades(lista);
  }

  /**
   * Agrega una actividad a un cliente
   */
  public static async crearActividad(
    clienteId: number,
    datos: { descripcion: string; fechaCompromiso?: string | null }
  ): Promise<ActividadConEstado> {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, clienteId));
    if (!cliente) {
      throw new Error(`Cliente con id ${clienteId} no encontrado.`);
    }

    if (!datos.descripcion || datos.descripcion.trim() === '') {
      throw new Error('La descripción de la actividad es requerida.');
    }

    const [nueva] = await db
      .insert(actividades)
      .values({
        clienteId,
        descripcion: datos.descripcion.trim(),
        fechaCompromiso: datos.fechaCompromiso?.trim() || null,
        fechaFinalizacion: null,
      })
      .returning();

    return this.ordenarActividades([nueva])[0];
  }

  /**
   * Actualiza una actividad existente.
   * Regla de negocio: Las completadas NO se pueden editar ni borrar individualmente.
   */
  public static async actualizarActividad(
    clienteId: number,
    actividadId: number,
    datos: { descripcion?: string; fechaCompromiso?: string | null }
  ): Promise<ActividadConEstado> {
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(eq(actividades.id, actividadId));

    if (!actividad || actividad.clienteId !== clienteId) {
      throw new Error(`Actividad con id ${actividadId} no encontrada para el cliente ${clienteId}.`);
    }

    if (actividad.fechaFinalizacion && actividad.fechaFinalizacion.trim() !== '') {
      throw new Error('Las actividades completadas no se pueden editar.');
    }

    const payload: Partial<NuevaActividad> = {};
    if (datos.descripcion !== undefined) {
      if (!datos.descripcion.trim()) {
        throw new Error('La descripción no puede estar vacía.');
      }
      payload.descripcion = datos.descripcion.trim();
    }
    if (datos.fechaCompromiso !== undefined) {
      payload.fechaCompromiso = datos.fechaCompromiso?.trim() || null;
    }

    const [actualizada] = await db
      .update(actividades)
      .set(payload)
      .where(eq(actividades.id, actividadId))
      .returning();

    return this.ordenarActividades([actualizada])[0];
  }

  /**
   * Elimina una actividad.
   * Regla de negocio: Las completadas NO se pueden editar ni borrar individualmente.
   */
  public static async borrarActividad(clienteId: number, actividadId: number): Promise<boolean> {
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(eq(actividades.id, actividadId));

    if (!actividad || actividad.clienteId !== clienteId) {
      return false;
    }

    if (actividad.fechaFinalizacion && actividad.fechaFinalizacion.trim() !== '') {
      throw new Error('Las actividades completadas no se pueden borrar.');
    }

    await db.delete(actividades).where(eq(actividades.id, actividadId));
    return true;
  }

  /**
   * Completa una actividad estableciendo la fecha de finalización actual.
   */
  public static async completarActividad(clienteId: number, actividadId: number): Promise<ActividadConEstado> {
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(eq(actividades.id, actividadId));

    if (!actividad || actividad.clienteId !== clienteId) {
      throw new Error(`Actividad con id ${actividadId} no encontrada para el cliente ${clienteId}.`);
    }

    const hoyStr = new Date().toISOString().split('T')[0];

    const [actualizada] = await db
      .update(actividades)
      .set({ fechaFinalizacion: hoyStr })
      .where(eq(actividades.id, actividadId))
      .returning();

    return this.ordenarActividades([actualizada])[0];
  }
}
