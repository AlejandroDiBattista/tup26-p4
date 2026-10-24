import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import { actividades, clientes, type Actividad, type Cliente } from "../db/schema.ts";
import { conflicto, invalido, noEncontrado } from "./errores.ts";

const CAMPOS = ["nombre", "email", "telefono", "direccion", "ciudad"] as const;
type DatosCliente = Partial<Record<(typeof CAMPOS)[number], string>>;
type DatosActividad = { descripcion?: string; fecha?: string | null };

export type ClienteConActividades = Cliente & { actividades: Actividad[] };

export class Clientes {
  // ---------- Clientes ----------

  /** Lista clientes. Cada palabra del texto debe aparecer en algún campo. */
  static listar(texto = ""): Cliente[] {
    const palabras = texto.trim().split(/\s+/).filter(Boolean);
    const condiciones = palabras.map((p) =>
      or(...CAMPOS.map((c) => like(clientes[c], `%${p}%`)), eq(sql`cast(${clientes.id} as text)`, p)),
    );
    return db
      .select()
      .from(clientes)
      .where(and(...condiciones))
      .orderBy(asc(sql`${clientes.nombre} collate nocase`))
      .all();
  }

  /** Devuelve la ficha del cliente con sus actividades (pendientes primero). */
  static obtener(id: number): ClienteConActividades {
    const cliente = db.select().from(clientes).where(eq(clientes.id, id)).get();
    if (!cliente) throw noEncontrado("Cliente");
    const lista = db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, id))
      .orderBy(
        asc(actividades.completada), // pendientes primero
        desc(actividades.completadaEn), // completadas: la más reciente arriba
        asc(sql`${actividades.fecha} is null`), // pendientes sin fecha al final
        asc(actividades.fecha),
      )
      .all();
    return { ...cliente, actividades: lista };
  }

  static crear(datos: DatosCliente): Cliente {
    const valores = Clientes.validarCliente(datos, true);
    return db.insert(clientes).values(valores as { nombre: string }).returning().get();
  }

  static actualizar(id: number, datos: DatosCliente): Cliente {
    const { actividades: _, ...actual } = Clientes.obtener(id);
    const valores = Clientes.validarCliente(datos, false);
    if (Object.keys(valores).length === 0) return actual;
    return db.update(clientes).set(valores).where(eq(clientes.id, id)).returning().get();
  }

  /** Elimina el cliente; sus actividades se borran en cascada. */
  static eliminar(id: number): void {
    Clientes.obtener(id);
    db.delete(clientes).where(eq(clientes.id, id)).run();
  }

  // ---------- Actividades ----------

  static agregarActividad(clienteId: number, datos: DatosActividad): Actividad {
    Clientes.obtener(clienteId);
    const valores = Clientes.validarActividad(datos, true);
    return db
      .insert(actividades)
      .values({ clienteId, descripcion: valores.descripcion!, fecha: valores.fecha ?? null })
      .returning()
      .get();
  }

  static actualizarActividad(id: number, datos: DatosActividad): Actividad {
    const actual = Clientes.actividadPendiente(id);
    const valores = Clientes.validarActividad(datos, false);
    if (Object.keys(valores).length === 0) return actual;
    return db.update(actividades).set(valores).where(eq(actividades.id, id)).returning().get();
  }

  static completarActividad(id: number): Actividad {
    Clientes.actividadPendiente(id);
    const d = new Date(); // fecha local AAAA-MM-DD
    const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return db
      .update(actividades)
      .set({ completada: true, completadaEn: hoy })
      .where(eq(actividades.id, id))
      .returning()
      .get();
  }

  static eliminarActividad(id: number): void {
    Clientes.actividadPendiente(id);
    db.delete(actividades).where(eq(actividades.id, id)).run();
  }

  // ---------- Reglas y validaciones ----------

  /** Busca la actividad y exige que no esté completada. */
  private static actividadPendiente(id: number): Actividad {
    const actividad = db.select().from(actividades).where(eq(actividades.id, id)).get();
    if (!actividad) throw noEncontrado("Actividad");
    if (actividad.completada) throw conflicto("Las actividades completadas no se pueden modificar");
    return actividad;
  }

  /** Limpia los datos del cliente y valida nombre y email. */
  private static validarCliente(datos: DatosCliente, esAlta: boolean): DatosCliente {
    const valores: DatosCliente = {};
    for (const campo of CAMPOS) {
      if (datos[campo] !== undefined) valores[campo] = String(datos[campo]).trim();
    }
    if ((esAlta || valores.nombre !== undefined) && !valores.nombre) throw invalido("El nombre es obligatorio");
    if (valores.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valores.email)) throw invalido("El email no es válido");
    return valores;
  }

  /** Limpia los datos de la actividad y valida descripción y fecha. */
  private static validarActividad(datos: DatosActividad, esAlta: boolean): DatosActividad {
    const valores: DatosActividad = {};
    if (datos.descripcion !== undefined) valores.descripcion = String(datos.descripcion).trim();
    if (datos.fecha !== undefined) valores.fecha = datos.fecha ? String(datos.fecha) : null;
    if ((esAlta || valores.descripcion !== undefined) && !valores.descripcion) throw invalido("La descripción es obligatoria");
    if (valores.fecha && !/^\d{4}-\d{2}-\d{2}$/.test(valores.fecha)) throw invalido("La fecha debe tener formato AAAA-MM-DD");
    return valores;
  }
}
