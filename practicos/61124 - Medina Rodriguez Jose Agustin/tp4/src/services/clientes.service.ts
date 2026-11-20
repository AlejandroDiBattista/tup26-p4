import { eq, or, like, asc } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { clientes, actividades } from '../db/esquema.ts';
import { ErrorHttp } from '../utils/error-http.ts';

type DatosCliente = {
  nombre?: string;
  email?: string;
  telefono?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
};

type DatosActividad = {
  descripcion?: string;
  fecha?: string | null;
};

export class Clientes {

  // ---------- Clientes ----------

  static async listar(busqueda?: string) {
    const consulta = db.select().from(clientes);

    if (busqueda && busqueda.trim() !== '') {
      const patron = `%${busqueda.trim()}%`;
      consulta.where(
        or(
          like(clientes.nombre, patron),
          like(clientes.email, patron),
          like(clientes.telefono, patron),
          like(clientes.direccion, patron),
          like(clientes.ciudad, patron),
        )
      );
    }

    return await consulta.orderBy(asc(clientes.nombre));
  }

  static async obtener(id: number) {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id));

    if (!cliente) {
      throw new ErrorHttp(404, `No existe el cliente ${id}`);
    }

    const lista = await db.select().from(actividades)
      .where(eq(actividades.clienteId, id));

    return { ...cliente, actividades: this.#ordenar(lista) };
  }

  static async crear(datos: DatosCliente) {
    const nombre = this.#textoObligatorio(datos.nombre, 'nombre');
    const email = this.#textoObligatorio(datos.email, 'email');

    const [creado] = await db.insert(clientes).values({
      nombre,
      email,
      telefono: datos.telefono ?? null,
      direccion: datos.direccion ?? null,
      ciudad: datos.ciudad ?? null,
    }).returning();

    return creado!;
  }

  static async actualizar(id: number, datos: DatosCliente) {
    await this.obtener(id);

    const cambios: DatosCliente = {};
    if (datos.nombre !== undefined)    cambios.nombre = this.#textoObligatorio(datos.nombre, 'nombre');
    if (datos.email !== undefined)     cambios.email = this.#textoObligatorio(datos.email, 'email');
    if (datos.telefono !== undefined)  cambios.telefono = datos.telefono || null;
    if (datos.direccion !== undefined) cambios.direccion = datos.direccion || null;
    if (datos.ciudad !== undefined)    cambios.ciudad = datos.ciudad || null;

    const [actualizado] = await db.update(clientes)
      .set(cambios)
      .where(eq(clientes.id, id))
      .returning();

    return actualizado!;
  }

  static async eliminar(id: number) {
    await this.obtener(id);
    await db.delete(clientes).where(eq(clientes.id, id));
  }

  // ---------- Actividades ----------

  static async agregarActividad(clienteId: number, datos: DatosActividad) {
    await this.obtener(clienteId);

    const descripcion = this.#textoObligatorio(datos.descripcion, 'descripcion');

    const [creada] = await db.insert(actividades).values({
      clienteId,
      descripcion,
      fecha: datos.fecha || null,
    }).returning();

    return creada!;
  }

  static async actualizarActividad(id: number, datos: DatosActividad) {
    const actividad = await this.#buscarActividad(id);

    if (actividad.completada) {
      throw new ErrorHttp(409, 'Una actividad completada no se puede editar');
    }

    const cambios: DatosActividad = {};
    if (datos.descripcion !== undefined) cambios.descripcion = this.#textoObligatorio(datos.descripcion, 'descripcion');
    if (datos.fecha !== undefined)       cambios.fecha = datos.fecha || null;

    const [actualizada] = await db.update(actividades)
      .set(cambios)
      .where(eq(actividades.id, id))
      .returning();

    return actualizada!;
  }

  static async completarActividad(id: number) {
    const actividad = await this.#buscarActividad(id);

    if (actividad.completada) {
      throw new ErrorHttp(409, 'La actividad ya está completada');
    }

    const hoy = new Date().toISOString().slice(0, 10);

    const [completada] = await db.update(actividades)
      .set({ completada: true, completadaEl: hoy })
      .where(eq(actividades.id, id))
      .returning();

    return completada!;
  }

  static async eliminarActividad(id: number) {
    const actividad = await this.#buscarActividad(id);

    if (actividad.completada) {
      throw new ErrorHttp(409, 'Una actividad completada no se puede eliminar');
    }

    await db.delete(actividades).where(eq(actividades.id, id));
  }

  // ---------- Privados ----------

  static async #buscarActividad(id: number) {
    const [actividad] = await db.select().from(actividades).where(eq(actividades.id, id));

    if (!actividad) {
      throw new ErrorHttp(404, `No existe la actividad ${id}`);
    }

    return actividad;
  }

  static #textoObligatorio(valor: string | undefined, campo: string) {
    const texto = (valor ?? '').trim();

    if (texto === '') {
      throw new ErrorHttp(400, `El campo ${campo} es obligatorio`);
    }

    return texto;
  }

  static #ordenar(lista: typeof actividades.$inferSelect[]) {
    const pendientes = lista
      .filter(a => !a.completada)
      .sort((a, b) => (a.fecha ?? '9999').localeCompare(b.fecha ?? '9999'));

    const hechas = lista
      .filter(a => a.completada)
      .sort((a, b) => (b.completadaEl ?? '').localeCompare(a.completadaEl ?? ''));

    return [...pendientes, ...hechas];
  }
}