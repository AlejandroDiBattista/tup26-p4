import { asc, eq, like, or, sql } from "drizzle-orm";
import type { Actividad, Cliente, NuevaActividad, NuevoCliente } from "../db/schema.js";
import { actividades, clientes } from "../db/schema.js";
import { db } from "../db/index.js";

export type CrearClienteInput = Omit<NuevoCliente, "id">;
export type ActualizarClienteInput = Partial<CrearClienteInput>;
export type CrearActividadInput = Pick<NuevaActividad, "descripcion" | "fechaCompromiso">;
export type ActualizarActividadInput = Partial<CrearActividadInput>;

export type CodigoErrorServicio = "VALIDACION" | "NO_ENCONTRADO" | "CONFLICTO";

export class ErrorServicio extends Error {
  constructor(
    message: string,
    public readonly codigo: CodigoErrorServicio,
  ) {
    super(message);
    this.name = "ErrorServicio";
  }
}

function validarId(id: number, entidad: string): void {
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorServicio(`El id de ${entidad} debe ser un entero positivo.`, "VALIDACION");
  }
}

function textoObligatorio(valor: string, campo: string): string {
  if (typeof valor !== "string") {
    throw new ErrorServicio(`El campo ${campo} debe ser texto.`, "VALIDACION");
  }
  const normalizado = valor.trim();
  if (!normalizado) {
    throw new ErrorServicio(`El campo ${campo} es obligatorio.`, "VALIDACION");
  }
  return normalizado;
}

function validarEmail(email: string): string {
  const normalizado = textoObligatorio(email, "email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizado)) {
    throw new ErrorServicio("El email debe tener un formato válido.", "VALIDACION");
  }
  return normalizado;
}

function textoOpcional(valor: string | null): string | null {
  if (valor === null) return null;
  if (typeof valor !== "string") {
    throw new ErrorServicio("Los campos opcionales deben ser texto o null.", "VALIDACION");
  }
  const normalizado = valor.trim();
  return normalizado || null;
}

function prepararCliente(datos: CrearClienteInput): CrearClienteInput {
  return {
    nombre: textoObligatorio(datos.nombre, "nombre"),
    apellido: textoObligatorio(datos.apellido, "apellido"),
    email: validarEmail(datos.email),
    domicilio: textoOpcional(datos.domicilio ?? null),
    localidad: textoOpcional(datos.localidad ?? null),
    telefono: textoOpcional(datos.telefono ?? null),
  };
}

function prepararCambiosCliente(cambios: ActualizarClienteInput): ActualizarClienteInput {
  const cambiosPreparados: ActualizarClienteInput = {};

  if (cambios.nombre !== undefined) cambiosPreparados.nombre = textoObligatorio(cambios.nombre, "nombre");
  if (cambios.apellido !== undefined) cambiosPreparados.apellido = textoObligatorio(cambios.apellido, "apellido");
  if (cambios.email !== undefined) cambiosPreparados.email = validarEmail(cambios.email);
  if (cambios.domicilio !== undefined) cambiosPreparados.domicilio = textoOpcional(cambios.domicilio);
  if (cambios.localidad !== undefined) cambiosPreparados.localidad = textoOpcional(cambios.localidad);
  if (cambios.telefono !== undefined) cambiosPreparados.telefono = textoOpcional(cambios.telefono);

  if (Object.keys(cambiosPreparados).length === 0) {
    throw new ErrorServicio("Debe indicar al menos un campo para actualizar.", "VALIDACION");
  }

  return cambiosPreparados;
}

function validarFecha(fecha: Date | null | undefined, campo: string): void {
  if (fecha instanceof Date && Number.isNaN(fecha.getTime())) {
    throw new ErrorServicio(`El campo ${campo} debe ser una fecha válida.`, "VALIDACION");
  }
}

function obtenerActividadEditable(id: number): Actividad {
  validarId(id, "actividad");
  const [actividad] = db.select().from(actividades).where(eq(actividades.id, id)).limit(1).all();

  if (!actividad) {
    throw new ErrorServicio(`No existe la actividad con id ${id}.`, "NO_ENCONTRADO");
  }
  if (actividad.fechaFinalizacion !== null) {
    throw new ErrorServicio("La actividad está completada y no se puede modificar.", "CONFLICTO");
  }
  return actividad;
}

export class Clientes {
  static listar(): Cliente[] {
    return db.select().from(clientes).orderBy(asc(clientes.id)).all();
  }

  static obtenerPorId(id: number): Cliente {
    validarId(id, "cliente");
    const [cliente] = db.select().from(clientes).where(eq(clientes.id, id)).limit(1).all();
    if (!cliente) {
      throw new ErrorServicio(`No existe el cliente con id ${id}.`, "NO_ENCONTRADO");
    }
    return cliente;
  }

  static buscar(termino: string): Cliente[] {
    const consulta = termino.trim();
    if (!consulta) return [];

    const patron = `%${consulta}%`;
    const coincidencias = or(
      like(sql<string>`cast(${clientes.id} as text)`, patron),
      like(clientes.nombre, patron),
      like(clientes.apellido, patron),
      like(clientes.email, patron),
      like(clientes.domicilio, patron),
      like(clientes.localidad, patron),
      like(clientes.telefono, patron),
    );

    return db.select().from(clientes).where(coincidencias).orderBy(asc(clientes.id)).all();
  }

  static crear(datos: CrearClienteInput): Cliente {
    const datosPreparados = prepararCliente(datos);
    const [cliente] = db.insert(clientes).values(datosPreparados).returning().all();
    return cliente;
  }

  static actualizar(id: number, cambios: ActualizarClienteInput): Cliente {
    validarId(id, "cliente");
    const cambiosPreparados = prepararCambiosCliente(cambios);
    const [cliente] = db
      .update(clientes)
      .set(cambiosPreparados)
      .where(eq(clientes.id, id))
      .returning()
      .all();

    if (!cliente) {
      throw new ErrorServicio(`No existe el cliente con id ${id}.`, "NO_ENCONTRADO");
    }
    return cliente;
  }

  static eliminar(id: number): Cliente {
    validarId(id, "cliente");

    return db.transaction((tx) => {
      const [cliente] = tx.select().from(clientes).where(eq(clientes.id, id)).limit(1).all();
      if (!cliente) {
        throw new ErrorServicio(`No existe el cliente con id ${id}.`, "NO_ENCONTRADO");
      }

      const [actividad] = tx
        .select({ id: actividades.id })
        .from(actividades)
        .where(eq(actividades.clienteId, id))
        .limit(1)
        .all();
      if (actividad) {
        throw new ErrorServicio(
          "No se puede eliminar un cliente que tiene actividades asociadas.",
          "CONFLICTO",
        );
      }

      tx.delete(clientes).where(eq(clientes.id, id)).run();
      return cliente;
    });
  }

  static listarActividades(clienteId: number): Actividad[] {
    validarId(clienteId, "cliente");
    this.obtenerPorId(clienteId);
    return db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, clienteId))
      .orderBy(asc(actividades.id))
      .all();
  }

  static obtenerActividadPorId(id: number): Actividad {
    validarId(id, "actividad");
    const [actividad] = db.select().from(actividades).where(eq(actividades.id, id)).limit(1).all();
    if (!actividad) {
      throw new ErrorServicio(`No existe la actividad con id ${id}.`, "NO_ENCONTRADO");
    }
    return actividad;
  }

  static obtenerActividadDeCliente(clienteId: number, actividadId: number): Actividad {
    validarId(clienteId, "cliente");
    const actividad = this.obtenerActividadPorId(actividadId);
    if (actividad.clienteId !== clienteId) {
      throw new ErrorServicio(
        `La actividad ${actividadId} no pertenece al cliente ${clienteId}.`,
        "NO_ENCONTRADO",
      );
    }
    return actividad;
  }

  static crearActividad(clienteId: number, datos: CrearActividadInput): Actividad {
    validarId(clienteId, "cliente");
    this.obtenerPorId(clienteId);
    const descripcion = textoObligatorio(datos.descripcion, "descripción de la actividad");
    validarFecha(datos.fechaCompromiso, "fecha de compromiso");

    const [actividad] = db
      .insert(actividades)
      .values({
        clienteId,
        descripcion,
        fechaCompromiso: datos.fechaCompromiso ?? null,
        fechaFinalizacion: null,
      })
      .returning()
      .all();
    return actividad;
  }

  static actualizarActividad(id: number, cambios: ActualizarActividadInput): Actividad {
    obtenerActividadEditable(id);
    const cambiosPreparados: ActualizarActividadInput = {};

    if (cambios.descripcion !== undefined) {
      cambiosPreparados.descripcion = textoObligatorio(cambios.descripcion, "descripción de la actividad");
    }
    if (cambios.fechaCompromiso !== undefined) {
      validarFecha(cambios.fechaCompromiso, "fecha de compromiso");
      cambiosPreparados.fechaCompromiso = cambios.fechaCompromiso;
    }
    if (Object.keys(cambiosPreparados).length === 0) {
      throw new ErrorServicio("Debe indicar al menos un campo para actualizar.", "VALIDACION");
    }

    const [actividad] = db
      .update(actividades)
      .set(cambiosPreparados)
      .where(eq(actividades.id, id))
      .returning()
      .all();
    return actividad;
  }

  static actualizarActividadDeCliente(
    clienteId: number,
    actividadId: number,
    cambios: ActualizarActividadInput,
  ): Actividad {
    this.obtenerActividadDeCliente(clienteId, actividadId);
    return this.actualizarActividad(actividadId, cambios);
  }

  static completarActividad(id: number): Actividad {
    obtenerActividadEditable(id);
    const [actividad] = db
      .update(actividades)
      .set({ fechaFinalizacion: new Date() })
      .where(eq(actividades.id, id))
      .returning()
      .all();
    return actividad;
  }

  static completarActividadDeCliente(clienteId: number, actividadId: number): Actividad {
    this.obtenerActividadDeCliente(clienteId, actividadId);
    return this.completarActividad(actividadId);
  }

  static eliminarActividad(id: number): Actividad {
    obtenerActividadEditable(id);
    const [actividad] = db
      .delete(actividades)
      .where(eq(actividades.id, id))
      .returning()
      .all();
    return actividad;
  }

  static eliminarActividadDeCliente(clienteId: number, actividadId: number): Actividad {
    this.obtenerActividadDeCliente(clienteId, actividadId);
    return this.eliminarActividad(actividadId);
  }
}
