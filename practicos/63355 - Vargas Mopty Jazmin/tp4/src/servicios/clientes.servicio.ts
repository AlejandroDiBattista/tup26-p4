import { and, asc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { actividades, clientes } from '../db/esquema.js';

type Cliente = typeof clientes.$inferSelect;
type Actividad = typeof actividades.$inferSelect;
type ClienteConActividades = Cliente & { actividades: Actividad[] };
type DatosCliente = Omit<Cliente, 'id'>;
type DatosActividad = Pick<Actividad, 'descripcion' | 'fechaCompromiso'>;

export type ErrorClientes = { error: string; estado: 400 | 404 };
export type Resultado<T> = T | ErrorClientes;

export class Clientes {
  static listar(busqueda?: string): Cliente[] {
    const listado = db.select().from(clientes)
      .orderBy(asc(clientes.apellido), asc(clientes.nombre)).all();
    const texto = busqueda?.trim().toLocaleLowerCase('es-AR');
    if (!texto) return listado;

    const coincidencias = new Set(
      db.select({ clienteId: actividades.clienteId, descripcion: actividades.descripcion })
        .from(actividades).all()
        .filter((actividad) => actividad.descripcion.toLocaleLowerCase('es-AR').includes(texto))
        .map((actividad) => actividad.clienteId),
    );

    return listado.filter((cliente) =>
      coincidencias.has(cliente.id) || Object.values(cliente).some((valor) =>
        valor !== null && String(valor).toLocaleLowerCase('es-AR').includes(texto),
      ),
    );
  }

  static obtenerPorId(id: number): ClienteConActividades | null {
    if (!Number.isSafeInteger(id) || id <= 0) return null;

    return db.query.clientes.findFirst({
      where: eq(clientes.id, id),
      with: { actividades: true },
    }).sync() ?? null;
  }

  static crear(datos: unknown): Resultado<ClienteConActividades> {
    const normalizados = this.normalizarCliente(datos);
    if ('error' in normalizados) return normalizados;

    const [cliente] = db.insert(clientes).values(normalizados).returning().all();
    return { ...cliente, actividades: [] };
  }

  static actualizar(id: number, datos: unknown): Resultado<ClienteConActividades> {
    const cliente = this.obtenerPorId(id);
    if (!cliente) return { error: 'Cliente no encontrado.', estado: 404 };

    const normalizados = this.normalizarCliente(datos);
    if ('error' in normalizados) return normalizados;

    db.update(clientes).set(normalizados).where(eq(clientes.id, id)).run();
    return { ...cliente, ...normalizados };
  }

  static eliminar(id: number): Resultado<{ id: number }> {
    if (!this.obtenerPorId(id)) return { error: 'Cliente no encontrado.', estado: 404 };

    db.delete(clientes).where(eq(clientes.id, id)).run();
    return { id };
  }

  static agregarActividad(clienteId: number, datos: unknown): Resultado<Actividad> {
    if (!this.obtenerPorId(clienteId)) return { error: 'Cliente no encontrado.', estado: 404 };

    const normalizados = this.normalizarActividad(datos);
    if ('error' in normalizados) return normalizados;

    const [actividad] = db.insert(actividades).values({
      ...normalizados,
      clienteId,
      fechaFinalizacion: null,
    }).returning().all();
    return actividad;
  }

  static actualizarActividad(
    clienteId: number,
    actividadId: number,
    datos: unknown,
  ): Resultado<Actividad> {
    const actividad = this.obtenerActividad(clienteId, actividadId);
    if ('error' in actividad) return actividad;
    if (actividad.fechaFinalizacion !== null) {
      return { error: 'No se puede editar una actividad completada.', estado: 400 };
    }

    const normalizados = this.normalizarActividad(datos);
    if ('error' in normalizados) return normalizados;

    db.update(actividades).set(normalizados).where(eq(actividades.id, actividadId)).run();
    return { ...actividad, ...normalizados };
  }

  static completarActividad(clienteId: number, actividadId: number): Resultado<Actividad> {
    const actividad = this.obtenerActividad(clienteId, actividadId);
    if ('error' in actividad) return actividad;
    if (actividad.fechaFinalizacion !== null) return actividad;

    const hoy = new Date();
    const fechaFinalizacion = [
      hoy.getFullYear(),
      String(hoy.getMonth() + 1).padStart(2, '0'),
      String(hoy.getDate()).padStart(2, '0'),
    ].join('-');

    db.update(actividades).set({ fechaFinalizacion })
      .where(eq(actividades.id, actividadId)).run();
    return { ...actividad, fechaFinalizacion };
  }

  static eliminarActividad(clienteId: number, actividadId: number): Resultado<{ id: number }> {
    const actividad = this.obtenerActividad(clienteId, actividadId);
    if ('error' in actividad) return actividad;
    if (actividad.fechaFinalizacion !== null) {
      return { error: 'No se puede eliminar una actividad completada.', estado: 400 };
    }

    db.delete(actividades).where(eq(actividades.id, actividadId)).run();
    return { id: actividadId };
  }

  private static obtenerActividad(clienteId: number, actividadId: number): Resultado<Actividad> {
    if (!this.obtenerPorId(clienteId)) return { error: 'Cliente no encontrado.', estado: 404 };
    if (!Number.isSafeInteger(actividadId) || actividadId <= 0) {
      return { error: 'Actividad no encontrada.', estado: 404 };
    }

    return db.select().from(actividades).where(and(
      eq(actividades.id, actividadId),
      eq(actividades.clienteId, clienteId),
    )).get() ?? { error: 'Actividad no encontrada para este cliente.', estado: 404 };
  }

  private static esObjeto(datos: unknown): datos is Record<string, unknown> {
    return datos !== null && typeof datos === 'object' && !Array.isArray(datos);
  }

  private static normalizarCliente(datos: unknown): Resultado<DatosCliente> {
    if (!this.esObjeto(datos)) return { error: 'Los datos del cliente deben ser un objeto.', estado: 400 };
    if (typeof datos.nombre !== 'string' || !datos.nombre.trim()) {
      return { error: 'El nombre es obligatorio y debe ser texto.', estado: 400 };
    }
    if (typeof datos.apellido !== 'string' || !datos.apellido.trim()) {
      return { error: 'El apellido es obligatorio y debe ser texto.', estado: 400 };
    }
    if (typeof datos.email !== 'string' || !datos.email.trim()) {
      return { error: 'El email es obligatorio y debe ser texto.', estado: 400 };
    }

    for (const campo of ['telefono', 'domicilio', 'localidad']) {
      if (datos[campo] != null && typeof datos[campo] !== 'string') {
        return { error: `El campo ${campo} debe ser texto o null.`, estado: 400 };
      }
    }

    return {
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      email: datos.email.trim().toLowerCase(),
      telefono: typeof datos.telefono === 'string' ? datos.telefono.trim() || null : null,
      domicilio: typeof datos.domicilio === 'string' ? datos.domicilio.trim() || null : null,
      localidad: typeof datos.localidad === 'string' ? datos.localidad.trim() || null : null,
    };
  }

  private static normalizarActividad(datos: unknown): Resultado<DatosActividad> {
    if (!this.esObjeto(datos)) return { error: 'Los datos de la actividad deben ser un objeto.', estado: 400 };
    if (typeof datos.descripcion !== 'string' || !datos.descripcion.trim()) {
      return { error: 'La descripción es obligatoria y debe ser texto.', estado: 400 };
    }
    if (datos.fechaCompromiso != null && typeof datos.fechaCompromiso !== 'string') {
      return { error: 'La fecha de compromiso debe ser texto o null.', estado: 400 };
    }

    const fechaCompromiso = typeof datos.fechaCompromiso === 'string'
      ? datos.fechaCompromiso.trim() || null
      : null;

    if (fechaCompromiso) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaCompromiso)) {
        return { error: 'La fecha de compromiso debe tener formato YYYY-MM-DD.', estado: 400 };
      }

      const fecha = new Date(`${fechaCompromiso}T00:00:00`);
      const [anio, mes, dia] = fechaCompromiso.split('-').map(Number);
      if (fecha.getFullYear() !== anio || fecha.getMonth() + 1 !== mes || fecha.getDate() !== dia) {
        return { error: 'La fecha de compromiso no es válida.', estado: 400 };
      }
    }

    return { descripcion: datos.descripcion.trim(), fechaCompromiso };
  }
}
