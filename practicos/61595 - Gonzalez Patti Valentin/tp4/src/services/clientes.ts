import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { ErrorServicio } from "./error.js";
import {
  actividades,
  clientes,
  type Actividad,
  type Cliente,
  type NuevaActividad,
  type NuevoCliente,
} from "../db/schema.js";

export type DatosCliente = Omit<NuevoCliente, "id">;
export type CambiosCliente = Partial<DatosCliente>;
export type DatosActividad = Omit<NuevaActividad, "id" | "clienteId">;
export type CambiosActividad = Partial<DatosActividad>;

export type EstadoActividad = "pendiente" | "vencida" | "completada";
export type ActividadConEstado = Actividad & { estado: EstadoActividad };
export type ClienteConActividades = Cliente & { actividades: ActividadConEstado[] };

function normalizarNombre(valor: string): string {
  if (typeof valor !== "string") throw new ErrorServicio("El nombre y el apellido son obligatorios.");
  const nombre = valor.trim().replace(/\s+/g, " ").toLocaleLowerCase("es-AR");
  const normalizado = nombre.replace(/(^|[\s'-])\p{L}/gu, (letra) =>
    letra.toLocaleUpperCase("es-AR"),
  );

  if (!normalizado) throw new ErrorServicio("El nombre y el apellido son obligatorios.");
  return normalizado;
}

function normalizarEmail(valor: string): string {
  if (typeof valor !== "string") throw new ErrorServicio("El email es obligatorio.");
  const email = valor.trim().toLocaleLowerCase("es-AR");
  if (!email) throw new ErrorServicio("El email es obligatorio.");
  return email;
}

function normalizarTelefono(valor: string | null): string | null {
  if (valor === null) return null;
  if (typeof valor !== "string") throw new ErrorServicio("El teléfono debe ser texto.");
  const texto = valor.trim();
  const digitos = texto.replace(/\D/g, "");
  if (!digitos) return null;
  return `${texto.startsWith("+") ? "+" : ""}${digitos}`;
}

function normalizarTextoOpcional(valor: string | null): string | null {
  if (valor !== null && typeof valor !== "string") throw new ErrorServicio("El dato debe ser texto.");
  return valor?.trim() || null;
}

function normalizarFecha(valor: string | null): string | null {
  if (valor === null) return null;
  if (typeof valor !== "string") throw new ErrorServicio("La fecha debe ser texto o nula.");
  const fecha = valor.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new ErrorServicio("Las fechas deben usar el formato AAAA-MM-DD.");
  }

  const fechaParseada = new Date(`${fecha}T00:00:00.000Z`);
  if (Number.isNaN(fechaParseada.valueOf()) || fechaParseada.toISOString().slice(0, 10) !== fecha) {
    throw new ErrorServicio("La fecha indicada no es válida.");
  }
  return fecha;
}

function fechaLocalDeHoy(): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const parte = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((item) => item.type === tipo)?.value ?? "";
  return `${parte("year")}-${parte("month")}-${parte("day")}`;
}

function conEstado(actividad: Actividad, hoy = fechaLocalDeHoy()): ActividadConEstado {
  const estado: EstadoActividad = actividad.fechaFinalizacion
    ? "completada"
    : actividad.fechaCompromiso && actividad.fechaCompromiso < hoy
      ? "vencida"
      : "pendiente";
  return { ...actividad, estado };
}

function normalizarDatosCliente(datos: DatosCliente): DatosCliente {
  return {
    nombre: normalizarNombre(datos.nombre),
    apellido: normalizarNombre(datos.apellido),
    email: normalizarEmail(datos.email),
    domicilio: normalizarTextoOpcional(datos.domicilio ?? null),
    localidad: normalizarTextoOpcional(datos.localidad ?? null),
    telefono: normalizarTelefono(datos.telefono ?? null),
  };
}

function normalizarCambiosCliente(datos: CambiosCliente): CambiosCliente {
  const cambios: CambiosCliente = {};
  if (datos.nombre !== undefined) cambios.nombre = normalizarNombre(datos.nombre);
  if (datos.apellido !== undefined) cambios.apellido = normalizarNombre(datos.apellido);
  if (datos.email !== undefined) cambios.email = normalizarEmail(datos.email);
  if (datos.domicilio !== undefined) cambios.domicilio = normalizarTextoOpcional(datos.domicilio);
  if (datos.localidad !== undefined) cambios.localidad = normalizarTextoOpcional(datos.localidad);
  if (datos.telefono !== undefined) cambios.telefono = normalizarTelefono(datos.telefono);
  return cambios;
}

function normalizarDescripcion(valor: string): string {
  if (typeof valor !== "string") throw new ErrorServicio("La descripción es obligatoria.");
  const descripcion = valor.trim().replace(/\s+/g, " ");
  if (!descripcion) throw new ErrorServicio("La descripción es obligatoria.");
  return descripcion;
}

function normalizarDatosActividad(datos: DatosActividad): DatosActividad {
  return {
    descripcion: normalizarDescripcion(datos.descripcion),
    fechaCompromiso: normalizarFecha(datos.fechaCompromiso ?? null),
    fechaFinalizacion: normalizarFecha(datos.fechaFinalizacion ?? null),
  };
}

function normalizarCambiosActividad(datos: CambiosActividad): CambiosActividad {
  const cambios: CambiosActividad = {};
  if (datos.descripcion !== undefined) cambios.descripcion = normalizarDescripcion(datos.descripcion);
  if (datos.fechaCompromiso !== undefined) cambios.fechaCompromiso = normalizarFecha(datos.fechaCompromiso);
  if (datos.fechaFinalizacion !== undefined) cambios.fechaFinalizacion = normalizarFecha(datos.fechaFinalizacion);
  return cambios;
}

function actividadesDe(clienteId: number): ActividadConEstado[] {
  return db.select().from(actividades)
    .where(eq(actividades.clienteId, clienteId))
    .all()
    .map((actividad) => conEstado(actividad));
}

function exigirCliente(id: number): Cliente {
  const cliente = db.select().from(clientes).where(eq(clientes.id, id)).get();
  if (!cliente) throw new ErrorServicio("Cliente no encontrado.", 404);
  return cliente;
}

function exigirActividad(id: number, clienteId?: number): Actividad {
  const actividad = db.select().from(actividades).where(eq(actividades.id, id)).get();
  if (!actividad || (clienteId !== undefined && actividad.clienteId !== clienteId)) {
    throw new ErrorServicio("Actividad no encontrada para este cliente.", 404);
  }
  return actividad;
}

export class Clientes {
  static listar(busqueda = ""): ClienteConActividades[] {
    const registros = db.select().from(clientes).all();
    const termino = busqueda.trim().toLocaleLowerCase("es-AR");

    return registros
      .map((cliente) => ({ ...cliente, actividades: actividadesDe(cliente.id) }))
      .filter((cliente) => {
        if (!termino) return true;
        const campos = [
          ...Object.values(cliente).filter((valor) => valor !== null),
          ...cliente.actividades.flatMap((actividad) => Object.values(actividad)),
        ];
        return campos.some((valor) => String(valor).toLocaleLowerCase("es-AR").includes(termino));
      });
  }

  static obtener(id: number): ClienteConActividades {
    const cliente = exigirCliente(id);
    return { ...cliente, actividades: actividadesDe(id) };
  }

  static listarActividades(clienteId: number): ActividadConEstado[] {
    exigirCliente(clienteId);
    return actividadesDe(clienteId);
  }

  static obtenerActividad(clienteId: number, id: number): ActividadConEstado {
    exigirCliente(clienteId);
    return conEstado(exigirActividad(id, clienteId));
  }

  static crear(datos: DatosCliente): Cliente {
    const cliente = db.insert(clientes).values(normalizarDatosCliente(datos)).returning().get();
    if (!cliente) throw new ErrorServicio("No se pudo crear el cliente.", 500);
    return cliente;
  }

  static actualizar(id: number, datos: CambiosCliente): Cliente {
    exigirCliente(id);
    const cambios = normalizarCambiosCliente(datos);
    if (Object.keys(cambios).length === 0) return exigirCliente(id);

    const cliente = db.update(clientes).set(cambios)
      .where(eq(clientes.id, id)).returning().get();
    if (!cliente) throw new ErrorServicio("Cliente no encontrado.", 404);
    return cliente;
  }

  static eliminar(id: number): void {
    exigirCliente(id);
    db.delete(clientes).where(eq(clientes.id, id)).run();
  }

  static crearActividad(clienteId: number, datos: DatosActividad): ActividadConEstado {
    exigirCliente(clienteId);
    const actividad = db.insert(actividades)
      .values({ clienteId, ...normalizarDatosActividad(datos) })
      .returning().get();
    if (!actividad) throw new ErrorServicio("No se pudo crear la actividad.", 500);
    return conEstado(actividad);
  }

  static actualizarActividad(clienteId: number, id: number, datos: CambiosActividad): ActividadConEstado {
    exigirCliente(clienteId);
    const actual = exigirActividad(id, clienteId);
    if (actual.fechaFinalizacion) {
      throw new ErrorServicio("No se puede editar una actividad completada.", 409);
    }

    const cambios = normalizarCambiosActividad(datos);
    if (Object.keys(cambios).length === 0) return conEstado(actual);

    const actividad = db.update(actividades).set(cambios)
      .where(eq(actividades.id, id)).returning().get();
    if (!actividad) throw new ErrorServicio("Actividad no encontrada.", 404);
    return conEstado(actividad);
  }

  static completarActividad(clienteId: number, id: number, fechaEjecucion = fechaLocalDeHoy()): ActividadConEstado {
    exigirCliente(clienteId);
    const actual = exigirActividad(id, clienteId);
    if (actual.fechaFinalizacion) {
      throw new ErrorServicio("La actividad ya está completada.", 409);
    }

    const actividad = db.update(actividades)
      .set({ fechaFinalizacion: normalizarFecha(fechaEjecucion) })
      .where(eq(actividades.id, id)).returning().get();
    if (!actividad) throw new ErrorServicio("Actividad no encontrada.", 404);
    return conEstado(actividad);
  }

  static eliminarActividad(clienteId: number, id: number): void {
    exigirCliente(clienteId);
    const actividad = exigirActividad(id, clienteId);
    if (actividad.fechaFinalizacion) {
      throw new ErrorServicio("No se puede eliminar una actividad completada.", 409);
    }
    db.delete(actividades).where(eq(actividades.id, id)).run();
  }
}
