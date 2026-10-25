import { and, eq, getTableColumns, like } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  actividades,
  clientes,
  type Actividad,
  type Cliente,
  type NuevaActividad,
  type NuevoCliente,
} from "../db/schema.js";
import { NoEncontrado, NoPermitido } from "./errores.js";
import { normalizarCliente } from "./normalizar.js";

export type EstadoActividad = "completada" | "vencida" | "pendiente";
type DatosActividad = Omit<NuevaActividad, "id" | "clienteId">;

// Fecha local de hoy en formato YYYY-MM-DD.
export function hoy(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function conEstado(cliente: Cliente & { actividades: Actividad[] }) {
  return {
    ...cliente,
    actividades: cliente.actividades.map((a) => ({ ...a, estado: Clientes.estado(a) })),
  };
}

export class Clientes {
  // ---- Clientes ----

  static async crear(datos: NuevoCliente): Promise<Cliente> {
    const [cliente] = await db.insert(clientes).values(normalizarCliente(datos)).returning();
    return cliente;
  }

  static async obtener(id: number) {
    const cliente = await db.query.clientes.findFirst({
      where: eq(clientes.id, id),
      with: { actividades: true },
    });
    if (!cliente) throw new NoEncontrado(`No existe el cliente ${id}`);
    return conEstado(cliente);
  }

  // Busca por cualquier combinación de campos. Los textos coinciden en forma
  // parcial y sin distinguir mayúsculas: { localidad: "ros" } encuentra "Rosario".
  static async buscar(filtro: Partial<Cliente> = {}) {
    const columnas = getTableColumns(clientes);
    const condiciones = Object.entries(normalizarCliente(filtro))
      .filter(([campo, valor]) => campo in columnas && valor !== null && valor !== undefined && valor !== "")
      .map(([campo, valor]) =>
        campo === "id"
          ? eq(clientes.id, Number(valor))
          : like(columnas[campo as keyof Cliente], `%${valor}%`),
      );

    const lista = await db.query.clientes.findMany({
      where: and(...condiciones),
      with: { actividades: true },
    });
    return lista.map(conEstado);
  }

  static async actualizar(id: number, cambios: Partial<Omit<NuevoCliente, "id">>): Promise<Cliente> {
    const [cliente] = await db
      .update(clientes)
      .set(normalizarCliente(cambios))
      .where(eq(clientes.id, id))
      .returning();
    if (!cliente) throw new NoEncontrado(`No existe el cliente ${id}`);
    return cliente;
  }

  // Borra el cliente junto con todas sus actividades, incluso las completadas.
  static async borrar(id: number): Promise<void> {
    const [, borrados] = await db.batch([
      db.delete(actividades).where(eq(actividades.clienteId, id)),
      db.delete(clientes).where(eq(clientes.id, id)).returning(),
    ]);
    if (borrados.length === 0) throw new NoEncontrado(`No existe el cliente ${id}`);
  }

  // ---- Actividades ----

  // Completada: tiene fecha de finalización.
  // Vencida: pendiente con fecha de compromiso anterior a hoy.
  static estado(actividad: Actividad): EstadoActividad {
    if (actividad.fechaFinalizacion) return "completada";
    if (actividad.fechaCompromiso && actividad.fechaCompromiso < hoy()) return "vencida";
    return "pendiente";
  }

  static async listarActividades(clienteId: number) {
    return (await Clientes.obtener(clienteId)).actividades;
  }

  static async agregarActividad(clienteId: number, datos: DatosActividad): Promise<Actividad> {
    await Clientes.obtener(clienteId);
    const [actividad] = await db
      .insert(actividades)
      .values({ ...datos, clienteId })
      .returning();
    return actividad;
  }

  static async actualizarActividad(
    clienteId: number,
    id: number,
    cambios: Partial<DatosActividad>,
  ): Promise<Actividad> {
    await Clientes.pendiente(clienteId, id);
    const [actividad] = await db
      .update(actividades)
      .set(cambios)
      .where(eq(actividades.id, id))
      .returning();
    return actividad;
  }

  static async completarActividad(clienteId: number, id: number, fecha = hoy()): Promise<Actividad> {
    return Clientes.actualizarActividad(clienteId, id, { fechaFinalizacion: fecha });
  }

  static async borrarActividad(clienteId: number, id: number): Promise<void> {
    await Clientes.pendiente(clienteId, id);
    await db.delete(actividades).where(eq(actividades.id, id));
  }

  // Devuelve la actividad si es del cliente y no está completada; si no, lanza un error.
  private static async pendiente(clienteId: number, id: number): Promise<Actividad> {
    const actividad = await db.query.actividades.findFirst({
      where: and(eq(actividades.id, id), eq(actividades.clienteId, clienteId)),
    });
    if (!actividad) throw new NoEncontrado(`El cliente ${clienteId} no tiene la actividad ${id}`);
    if (actividad.fechaFinalizacion) {
      throw new NoPermitido("Una actividad completada no se puede editar ni borrar");
    }
    return actividad;
  }
}
