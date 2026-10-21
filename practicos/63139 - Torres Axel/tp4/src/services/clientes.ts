import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { actividades, clientes, type Actividad, type Cliente, type NuevaActividad, type NuevoCliente } from '../db/schema.js';
import { ErrorServicio, fechaValida, idValido, normalizarBusqueda, objeto, texto } from './validacion.js';

export class Clientes {
  static listar(busqueda: unknown = ''): Cliente[] {
    if (typeof busqueda !== 'string') throw new ErrorServicio(400, 'La búsqueda debe ser texto.');
    const terminos = normalizarBusqueda(busqueda).trim().split(/\s+/).filter(Boolean);
    // Para este MiniCRM, filtrar en memoria permite ignorar tildes en todos los campos.
    return db.select().from(clientes).all()
      .filter((cliente) => {
        const campos = normalizarBusqueda(Object.values(cliente).join(' '));
        return terminos.every((termino) => campos.includes(termino));
      })
      .sort((a, b) => `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`, 'es') || a.id - b.id);
  }

  static obtener(id: unknown): Cliente {
    const cliente = db.select().from(clientes).where(eq(clientes.id, idValido(id))).get();
    if (!cliente) throw new ErrorServicio(404, 'Cliente no encontrado.');
    return cliente;
  }

  static detalle(id: unknown) {
    const cliente = this.obtener(id);
    return { ...cliente, actividades: this.listarActividades(cliente.id) };
  }

  private static datosCliente(entrada: unknown): Omit<NuevoCliente, 'id'> {
    const datos = objeto(entrada);
    const nombre = texto(datos.nombre, 'Nombre', 80, true)!;
    const apellido = texto(datos.apellido, 'Apellido', 80, true)!;
    const email = texto(datos.email, 'Email', 254, true)!.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ErrorServicio(400, 'El email no es válido.');
    const telefono = texto(datos.telefono, 'Teléfono', 40);
    if (telefono && !/^\+?[\d\s().-]+$/.test(telefono)) throw new ErrorServicio(400, 'El teléfono no es válido.');
    const telefonoLimpio = telefono?.replace(/[\s().-]/g, '') || null;
    if (telefonoLimpio && !/^\+?\d{6,20}$/.test(telefonoLimpio)) {
      throw new ErrorServicio(400, 'El teléfono debe tener entre 6 y 20 dígitos.');
    }
    return {
      nombre, apellido, email, telefono: telefonoLimpio,
      domicilio: texto(datos.domicilio, 'Domicilio', 200),
      localidad: texto(datos.localidad, 'Localidad', 100),
    };
  }

  static crear(entrada: unknown): Cliente {
    return db.insert(clientes).values(this.datosCliente(entrada)).returning().get();
  }

  static actualizar(id: unknown, entrada: unknown): Cliente {
    const actual = this.obtener(id);
    const datos = this.datosCliente({ ...actual, ...objeto(entrada) });
    return db.update(clientes).set(datos).where(eq(clientes.id, actual.id)).returning().get()!;
  }

  static eliminar(id: unknown): void {
    const cliente = this.obtener(id);
    // La clave foránea elimina en cascada todas las actividades del cliente.
    db.delete(clientes).where(eq(clientes.id, cliente.id)).run();
  }

  static listarActividades(clienteId: unknown): Actividad[] {
    const cliente = this.obtener(clienteId);
    return db.select().from(actividades).where(eq(actividades.clienteId, cliente.id)).all()
      .sort((a, b) => {
        if (Boolean(a.fechaFinalizacion) !== Boolean(b.fechaFinalizacion)) return a.fechaFinalizacion ? 1 : -1;
        if (a.fechaFinalizacion && b.fechaFinalizacion) return b.fechaFinalizacion.localeCompare(a.fechaFinalizacion) || b.id - a.id;
        // Sin fecha primero; después vencidos y finalmente actuales/futuros.
        return (a.fechaCompromiso ?? '').localeCompare(b.fechaCompromiso ?? '') || a.id - b.id;
      });
  }

  static obtenerActividad(clienteId: unknown, id: unknown): Actividad {
    const cliente = this.obtener(clienteId);
    const actividad = db.select().from(actividades).where(and(
      eq(actividades.id, idValido(id)), eq(actividades.clienteId, cliente.id),
    )).get();
    if (!actividad) throw new ErrorServicio(404, 'Actividad no encontrada para este cliente.');
    return actividad;
  }

  private static datosActividad(entrada: unknown): Pick<NuevaActividad, 'descripcion' | 'fechaCompromiso'> {
    const datos = objeto(entrada);
    if ('fechaFinalizacion' in datos) throw new ErrorServicio(400, 'Usá la operación completar para finalizar una actividad.');
    return {
      descripcion: texto(datos.descripcion, 'Descripción', 500, true)!,
      fechaCompromiso: fechaValida(datos.fechaCompromiso),
    };
  }

  static agregarActividad(clienteId: unknown, entrada: unknown): Actividad {
    const cliente = this.obtener(clienteId);
    return db.insert(actividades).values({ ...this.datosActividad(entrada), clienteId: cliente.id }).returning().get();
  }

  private static exigirPendiente(actividad: Actividad): void {
    if (actividad.fechaFinalizacion) throw new ErrorServicio(409, 'Las actividades completadas no se pueden editar ni borrar individualmente.');
  }

  static actualizarActividad(clienteId: unknown, id: unknown, entrada: unknown): Actividad {
    const actual = this.obtenerActividad(clienteId, id);
    this.exigirPendiente(actual);
    const datos = this.datosActividad({ descripcion: actual.descripcion, fechaCompromiso: actual.fechaCompromiso, ...objeto(entrada) });
    return db.update(actividades).set(datos).where(eq(actividades.id, actual.id)).returning().get()!;
  }

  static eliminarActividad(clienteId: unknown, id: unknown): void {
    const actividad = this.obtenerActividad(clienteId, id);
    this.exigirPendiente(actividad);
    db.delete(actividades).where(eq(actividades.id, actividad.id)).run();
  }

  static completarActividad(clienteId: unknown, id: unknown): Actividad {
    const actividad = this.obtenerActividad(clienteId, id);
    if (actividad.fechaFinalizacion) return actividad;
    return db.update(actividades).set({ fechaFinalizacion: new Date().toISOString() })
      .where(eq(actividades.id, actividad.id)).returning().get()!;
  }
}
