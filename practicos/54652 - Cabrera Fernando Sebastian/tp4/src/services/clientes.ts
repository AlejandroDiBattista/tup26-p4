import { asc, desc, eq } from "drizzle-orm";
import { db } from "../db/index";
import { actividades, clientes, type Actividad, type NuevoCliente } from "../db/schema";
import { HttpError } from "../errores";

const CAMPOS_OPCIONALES = ["empresa", "email", "telefono", "direccion", "notas"] as const;

/** Minúsculas y sin acentos, para que "perez" encuentre a "Pérez". */
function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

/** Toma solo los campos conocidos del cliente y los valida. */
function datosCliente(entrada: unknown, parcial: boolean): Partial<NuevoCliente> {
  if (!esObjeto(entrada)) throw new HttpError(400, "Los datos del cliente deben ser un objeto");
  const datos: Partial<NuevoCliente> = {};

  if ("nombre" in entrada || !parcial) {
    const nombre = typeof entrada.nombre === "string" ? entrada.nombre.trim() : "";
    if (!nombre) throw new HttpError(400, "El nombre es obligatorio");
    datos.nombre = nombre;
  }

  for (const campo of CAMPOS_OPCIONALES) {
    if (!(campo in entrada)) continue;
    const valor = entrada[campo];
    if (valor !== null && typeof valor !== "string") {
      throw new HttpError(400, `El campo ${campo} debe ser texto`);
    }
    datos[campo] = valor?.trim() || null; // texto vacío se guarda como null
  }

  if (datos.email && !/^\S+@\S+\.\S+$/.test(datos.email)) {
    throw new HttpError(400, "El email no es válido");
  }
  return datos;
}

/** Valida la descripción y la fecha (opcional, AAAA-MM-DD) de una actividad. */
function datosActividad(entrada: unknown) {
  if (!esObjeto(entrada)) throw new HttpError(400, "Los datos de la actividad deben ser un objeto");
  const descripcion = typeof entrada.descripcion === "string" ? entrada.descripcion.trim() : "";
  if (!descripcion) throw new HttpError(400, "La descripción es obligatoria");

  const fecha = typeof entrada.fecha === "string" && entrada.fecha !== "" ? entrada.fecha : null;
  if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new HttpError(400, "La fecha debe tener el formato AAAA-MM-DD");
  }
  return { descripcion, fecha };
}

export class Clientes {
  // ---------- Clientes ----------

  /** Lista los clientes; si hay texto, filtra por cualquier campo. */
  static listar(texto = "") {
    const todos = db.select().from(clientes).orderBy(asc(clientes.nombre)).all();
    const buscado = normalizar(texto.trim());
    if (!buscado) return todos;
    return todos.filter((c) => normalizar(Object.values(c).join(" ")).includes(buscado));
  }

  /** Devuelve el cliente con sus actividades separadas en pendientes y completadas. */
  static obtener(id: number) {
    const cliente = db.select().from(clientes).where(eq(clientes.id, id)).get();
    if (!cliente) throw new HttpError(404, "Cliente no encontrado");

    const lista = db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, id))
      .orderBy(asc(actividades.fecha), desc(actividades.completadaEn))
      .all();

    return {
      ...cliente,
      pendientes: lista.filter((a) => !a.completada),
      completadas: lista.filter((a) => a.completada),
    };
  }

  static crear(entrada: unknown) {
    const datos = datosCliente(entrada, false) as NuevoCliente;
    return db.insert(clientes).values(datos).returning().get();
  }

  static actualizar(id: number, entrada: unknown) {
    const datos = datosCliente(entrada, true);
    if (Object.keys(datos).length === 0) throw new HttpError(400, "No hay campos para actualizar");
    const cliente = db.update(clientes).set(datos).where(eq(clientes.id, id)).returning().get();
    if (!cliente) throw new HttpError(404, "Cliente no encontrado");
    return cliente;
  }

  /** Borra el cliente; sus actividades se borran en cascada. */
  static eliminar(id: number) {
    const cliente = db.delete(clientes).where(eq(clientes.id, id)).returning().get();
    if (!cliente) throw new HttpError(404, "Cliente no encontrado");
  }

  // ---------- Actividades ----------

  static agregarActividad(clienteId: number, entrada: unknown) {
    Clientes.obtener(clienteId); // lanza 404 si el cliente no existe
    const datos = datosActividad(entrada);
    return db.insert(actividades).values({ clienteId, ...datos }).returning().get();
  }

  static editarActividad(id: number, entrada: unknown) {
    Clientes.pendiente(id);
    const datos = datosActividad(entrada);
    return db.update(actividades).set(datos).where(eq(actividades.id, id)).returning().get();
  }

  static completarActividad(id: number) {
    Clientes.pendiente(id);
    return db
      .update(actividades)
      .set({ completada: true, completadaEn: new Date().toISOString() })
      .where(eq(actividades.id, id))
      .returning()
      .get();
  }

  static eliminarActividad(id: number) {
    Clientes.pendiente(id);
    db.delete(actividades).where(eq(actividades.id, id)).run();
  }

  /** Regla: una actividad completada no se puede editar, completar de nuevo ni borrar. */
  private static pendiente(id: number): Actividad {
    const actividad = db.select().from(actividades).where(eq(actividades.id, id)).get();
    if (!actividad) throw new HttpError(404, "Actividad no encontrada");
    if (actividad.completada) {
      throw new HttpError(409, "La actividad ya está completada y no se puede modificar");
    }
    return actividad;
  }
}
