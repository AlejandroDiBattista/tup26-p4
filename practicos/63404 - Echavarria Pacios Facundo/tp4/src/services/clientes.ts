import { asc, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { clientes, actividades } from '../db/schema.js';

export class ErrorHttp extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export class Clientes {
  static id(value: unknown): number {
    if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) {
      throw new ErrorHttp(400, 'ID inválido.');
    }
    return Number(value);
  }

  private static datos(value: unknown, campos: string[]): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).some(key => !campos.includes(key))) {
      throw new ErrorHttp(400, 'El cuerpo debe contener solamente los campos permitidos.');
    }
    return value as Record<string, unknown>;
  }

  private static texto(value: unknown, obligatorio = false): string {
    if (value === undefined && !obligatorio) return '';
    if (typeof value !== 'string' || (obligatorio && !value.trim())) {
      throw new ErrorHttp(400, 'Completá los campos obligatorios con texto válido.');
    }
    return value.trim();
  }

  private static datosCliente(value: unknown) {
    const datos = this.datos(value, ['nombre', 'email', 'telefono', 'direccion', 'ciudad']);
    const email = this.texto(datos.email);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ErrorHttp(400, 'Email inválido.');
    return { nombre: this.texto(datos.nombre, true), email,
      telefono: this.texto(datos.telefono), direccion: this.texto(datos.direccion), ciudad: this.texto(datos.ciudad) };
  }

  private static datosActividad(value: unknown) {
    const datos = this.datos(value, ['descripcion', 'fecha']);
    const fecha = datos.fecha === null || datos.fecha === undefined || datos.fecha === '' ? null : datos.fecha;
    if (fecha !== null && (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha) ||
      !Number.isFinite(Date.parse(fecha)) || new Date(fecha).toISOString().slice(0, 10) !== fecha)) {
      throw new ErrorHttp(400, 'Fecha inválida. Usá YYYY-MM-DD.');
    }
    return { descripcion: this.texto(datos.descripcion, true), fecha: fecha as string | null };
  }

  static listar(q: unknown = '') {
    if (typeof q !== 'string') throw new ErrorHttp(400, 'La búsqueda debe ser texto.');
    const busqueda = q.trim().toLocaleLowerCase('es');
    // shortcut: búsqueda en memoria para este TP; usar un índice de búsqueda si crece el volumen.
    return db.select().from(clientes).orderBy(asc(clientes.nombre), asc(clientes.id)).all()
      .filter(cliente => Object.values(cliente).some(valor => String(valor).toLocaleLowerCase('es').includes(busqueda)));
  }

  private static cliente(id: number) {
    const cliente = db.select().from(clientes).where(eq(clientes.id, id)).get();
    if (!cliente) throw new ErrorHttp(404, 'Cliente inexistente.');
    return cliente;
  }

  static obtener(id: number) {
    return { ...this.cliente(id), actividades: db.select().from(actividades)
      .where(eq(actividades.clienteId, id)).orderBy(desc(actividades.id)).all() };
  }

  static crear(value: unknown) {
    return db.insert(clientes).values(this.datosCliente(value)).returning().get();
  }

  static editar(id: number, value: unknown) {
    this.cliente(id);
    return db.update(clientes).set(this.datosCliente(value)).where(eq(clientes.id, id)).returning().get();
  }

  static eliminar(id: number) {
    this.cliente(id);
    db.delete(clientes).where(eq(clientes.id, id)).run();
  }

  private static actividad(clienteId: number, id: number) {
    this.cliente(clienteId);
    const actividad = db.select().from(actividades)
      .where(sql`${actividades.id} = ${id} AND ${actividades.clienteId} = ${clienteId}`).get();
    if (!actividad) throw new ErrorHttp(404, 'Actividad inexistente para este cliente.');
    return actividad;
  }

  private static pendiente(clienteId: number, id: number) {
    const actividad = this.actividad(clienteId, id);
    if (actividad.completadaEn) throw new ErrorHttp(409, 'La actividad completada es de solo lectura.');
    return actividad;
  }

  static agregarActividad(clienteId: number, value: unknown) {
    this.cliente(clienteId);
    return db.insert(actividades).values({ clienteId, ...this.datosActividad(value) }).returning().get();
  }

  static editarActividad(clienteId: number, id: number, value: unknown) {
    this.pendiente(clienteId, id);
    return db.update(actividades).set(this.datosActividad(value)).where(eq(actividades.id, id)).returning().get();
  }

  static completarActividad(clienteId: number, id: number, value: unknown) {
    this.datos(value ?? {}, []);
    const actividad = this.actividad(clienteId, id);
    if (actividad.completadaEn) return actividad;
    return db.update(actividades).set({ completadaEn: new Date().toISOString() })
      .where(eq(actividades.id, id)).returning().get();
  }

  static eliminarActividad(clienteId: number, id: number) {
    this.pendiente(clienteId, id);
    db.delete(actividades).where(eq(actividades.id, id)).run();
  }
}
