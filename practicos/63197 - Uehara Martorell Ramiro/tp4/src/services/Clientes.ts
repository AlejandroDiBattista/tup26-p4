import { and, asc, eq, like, or } from "drizzle-orm";
import { db } from "../db";
import { actividades, clientes, type Cliente } from "../db/schema";

export class ErrorNegocio extends Error {
  status: number;

  constructor(mensaje: string, status = 400) {
    super(mensaje);
    this.status = status;
  }
}

type DatosCliente = Partial<Omit<Cliente, "id">>;
type DatosActividad = { descripcion?: string; fecha?: string | null };

const CAMPOS_BUSQUEDA = [clientes.nombre, clientes.email, clientes.telefono, clientes.direccion, clientes.ciudad];

const limpiar = (valor: unknown) => (typeof valor === "string" ? valor.trim() : "");
const hoy = () => new Date().toLocaleDateString("sv-SE");

function validarCliente(datos: DatosCliente = {}) {
  const cliente = {
    nombre: limpiar(datos.nombre),
    email: limpiar(datos.email),
    telefono: limpiar(datos.telefono),
    direccion: limpiar(datos.direccion),
    ciudad: limpiar(datos.ciudad),
  };
  if (!cliente.nombre) throw new ErrorNegocio("El nombre es obligatorio");
  if (cliente.email && !/^\S+@\S+\.\S+$/.test(cliente.email)) throw new ErrorNegocio("El email no es válido");
  return cliente;
}

function validarActividad(datos: DatosActividad = {}) {
  const descripcion = limpiar(datos.descripcion);
  const fecha = limpiar(datos.fecha) || null;
  if (!descripcion) throw new ErrorNegocio("La descripción es obligatoria");
  if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new ErrorNegocio("La fecha debe tener formato AAAA-MM-DD");
  return { descripcion, fecha };
}

export class Clientes {
  // Cada palabra debe aparecer en algún campo del cliente (incluido el #id).
  static listar(texto = "") {
    const palabras = texto.trim().split(/\s+/).filter(Boolean);
    const filtros = palabras.map((palabra) => {
      const condiciones = CAMPOS_BUSQUEDA.map((campo) => like(campo, `%${palabra}%`));
      const numero = Number(palabra.replace(/^#/, ""));
      if (Number.isInteger(numero)) condiciones.push(eq(clientes.id, numero));
      return or(...condiciones);
    });
    return db.select().from(clientes).where(and(...filtros)).orderBy(asc(clientes.nombre)).all();
  }

  static obtener(id: number) {
    const cliente = db.select().from(clientes).where(eq(clientes.id, id)).get();
    if (!cliente) throw new ErrorNegocio("Cliente no encontrado", 404);
    const lista = db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, id))
      .orderBy(asc(actividades.fecha), asc(actividades.id))
      .all();
    return { ...cliente, actividades: lista };
  }

  static crear(datos: DatosCliente) {
    return db.insert(clientes).values(validarCliente(datos)).returning().get();
  }

  static actualizar(id: number, datos: DatosCliente) {
    const cliente = db.update(clientes).set(validarCliente(datos)).where(eq(clientes.id, id)).returning().get();
    if (!cliente) throw new ErrorNegocio("Cliente no encontrado", 404);
    return cliente;
  }

  static eliminar(id: number) {
    const cliente = db.delete(clientes).where(eq(clientes.id, id)).returning().get();
    if (!cliente) throw new ErrorNegocio("Cliente no encontrado", 404);
  }

  static agregarActividad(clienteId: number, datos: DatosActividad) {
    Clientes.obtener(clienteId);
    return db
      .insert(actividades)
      .values({ clienteId, ...validarActividad(datos) })
      .returning()
      .get();
  }

  static actualizarActividad(id: number, datos: DatosActividad) {
    Clientes.actividadPendiente(id);
    return db.update(actividades).set(validarActividad(datos)).where(eq(actividades.id, id)).returning().get();
  }

  static completarActividad(id: number) {
    Clientes.actividadPendiente(id);
    return db
      .update(actividades)
      .set({ completada: true, completadaEn: hoy() })
      .where(eq(actividades.id, id))
      .returning()
      .get();
  }

  static eliminarActividad(id: number) {
    Clientes.actividadPendiente(id);
    db.delete(actividades).where(eq(actividades.id, id)).run();
  }

  // Las actividades completadas quedan congeladas: no se editan ni se borran.
  private static actividadPendiente(id: number) {
    const actividad = db.select().from(actividades).where(eq(actividades.id, id)).get();
    if (!actividad) throw new ErrorNegocio("Actividad no encontrada", 404);
    if (actividad.completada) throw new ErrorNegocio("Las actividades completadas no se pueden modificar", 409);
    return actividad;
  }
}
