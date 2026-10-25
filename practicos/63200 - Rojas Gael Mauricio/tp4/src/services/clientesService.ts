import { and, eq, like, or } from "drizzle-orm";
import { db } from "../config/db.js";
import { actividades, clientes } from "../config/schema.js";

export class ErrorDeNegocio extends Error {
  constructor(message: string, public readonly statusCode = 400) {
    super(message);
    this.name = "ErrorDeNegocio";
  }
}

type DatosCliente = {
  nombre?: unknown; apellido?: unknown; email?: unknown;
  domicilio?: unknown; localidad?: unknown; telefono?: unknown;
};

type DatosActividad = { descripcion?: unknown; fechaCompromiso?: unknown };

const requerido = (value: unknown, campo: string): string => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ErrorDeNegocio(`El campo ${campo} es obligatorio.`);
  }
  return value.trim();
};

const opcional = (value: unknown, campo: string): string | null => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") {
    throw new ErrorDeNegocio(`El campo ${campo} debe ser texto.`);
  }
  return value.trim() || null;
};

const idValido = (id: number): number => {
  if (!Number.isInteger(id) || id < 1) {
    throw new ErrorDeNegocio("El identificador debe ser un entero positivo.");
  }
  return id;
};

const fecha = (value: unknown, campo: string): string | null => {
  const result = opcional(value, campo);
  if (result !== null && !/^\d{4}-\d{2}-\d{2}$/.test(result)) {
    throw new ErrorDeNegocio(`El campo ${campo} debe tener formato AAAA-MM-DD.`);
  }
  return result;
};

const clienteExistente = (id: number) => {
  const cliente = db.select().from(clientes).where(eq(clientes.id, id)).get();
  if (!cliente) throw new ErrorDeNegocio("Cliente no encontrado.", 404);
  return cliente;
};

const actividadExistente = (id: number) => {
  const actividad = db.select().from(actividades).where(eq(actividades.id, id)).get();
  if (!actividad) throw new ErrorDeNegocio("Actividad no encontrada.", 404);
  return actividad;
};

export class Clientes {
  static listar(busqueda = "") {
    const termino = busqueda.trim();
    if (!termino) return db.select().from(clientes).all();
    const patron = `%${termino}%`;
    return db.select().from(clientes).where(or(
      like(clientes.nombre, patron), like(clientes.apellido, patron),
      like(clientes.email, patron), like(clientes.domicilio, patron),
      like(clientes.localidad, patron), like(clientes.telefono, patron),
    )).all();
  }

  static obtener(id: number) {
    const cliente = clienteExistente(idValido(id));
    return {
      ...cliente,
      actividades: db.select().from(actividades)
        .where(eq(actividades.clienteId, cliente.id)).all(),
    };
  }

  static crear(datos: DatosCliente) {
    return db.insert(clientes).values({
      nombre: requerido(datos.nombre, "nombre"),
      apellido: requerido(datos.apellido, "apellido"),
      email: requerido(datos.email, "email").toLowerCase(),
      domicilio: opcional(datos.domicilio, "domicilio"),
      localidad: opcional(datos.localidad, "localidad"),
      telefono: opcional(datos.telefono, "telefono"),
    }).returning().get();
  }

  static actualizar(id: number, datos: DatosCliente) {
    const clienteId = idValido(id);
    clienteExistente(clienteId);
    const cambios: Partial<typeof clientes.$inferInsert> = {};
    if ("nombre" in datos) cambios.nombre = requerido(datos.nombre, "nombre");
    if ("apellido" in datos) cambios.apellido = requerido(datos.apellido, "apellido");
    if ("email" in datos) cambios.email = requerido(datos.email, "email").toLowerCase();
    if ("domicilio" in datos) cambios.domicilio = opcional(datos.domicilio, "domicilio");
    if ("localidad" in datos) cambios.localidad = opcional(datos.localidad, "localidad");
    if ("telefono" in datos) cambios.telefono = opcional(datos.telefono, "telefono");
    if (Object.keys(cambios).length === 0) {
      throw new ErrorDeNegocio("Debe enviar al menos un campo para actualizar.");
    }
    return db.update(clientes).set(cambios)
      .where(eq(clientes.id, clienteId)).returning().get();
  }

  static eliminar(id: number) {
    const clienteId = idValido(id);
    clienteExistente(clienteId);
    db.delete(clientes).where(eq(clientes.id, clienteId)).run();
  }

  static listarActividades(clienteId: number) {
    const id = idValido(clienteId);
    clienteExistente(id);
    return db.select().from(actividades).where(eq(actividades.clienteId, id)).all();
  }

  static crearActividad(clienteId: number, datos: DatosActividad) {
    const id = idValido(clienteId);
    clienteExistente(id);
    return db.insert(actividades).values({
      clienteId: id,
      descripcion: requerido(datos.descripcion, "descripcion"),
      fechaCompromiso: fecha(datos.fechaCompromiso, "fechaCompromiso"),
      fechaFinalizacion: null,
    }).returning().get();
  }

  static actualizarActividad(id: number, datos: DatosActividad) {
    const actividad = actividadExistente(idValido(id));
    if (actividad.fechaFinalizacion) {
      throw new ErrorDeNegocio("Una actividad completada no se puede editar.");
    }
    const cambios: Partial<typeof actividades.$inferInsert> = {};
    if ("descripcion" in datos) cambios.descripcion = requerido(datos.descripcion, "descripcion");
    if ("fechaCompromiso" in datos) cambios.fechaCompromiso = fecha(datos.fechaCompromiso, "fechaCompromiso");
    if (Object.keys(cambios).length === 0) {
      throw new ErrorDeNegocio("Debe enviar al menos un campo para actualizar.");
    }
    return db.update(actividades).set(cambios)
      .where(and(eq(actividades.id, actividad.id), eq(actividades.clienteId, actividad.clienteId)))
      .returning().get();
  }

  static completarActividad(id: number) {
    const actividad = actividadExistente(idValido(id));
    if (actividad.fechaFinalizacion) return actividad;
    return db.update(actividades)
      .set({ fechaFinalizacion: new Date().toISOString().slice(0, 10) })
      .where(eq(actividades.id, actividad.id)).returning().get();
  }

  static eliminarActividad(id: number) {
    const actividad = actividadExistente(idValido(id));
    if (actividad.fechaFinalizacion) {
      throw new ErrorDeNegocio("Una actividad completada no se puede borrar.");
    }
    db.delete(actividades).where(eq(actividades.id, actividad.id)).run();
  }
}
