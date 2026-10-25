import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "../db/database.js";
import { actividades, clientes } from "../db/schema.js";
import { ErrorServicio } from "./ErrorServicio.js";

export interface DatosCliente {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
}

export interface DatosActividad {
  descripcion: string;
  fecha?: string | null;
}

export class Clientes {
  
    private static validarDatos(datos: DatosCliente) {
    const nombre = datos.nombre?.trim();
    const email = datos.email?.trim().toLowerCase();
    const telefono = datos.telefono?.trim();
    const direccion = datos.direccion?.trim();

    if (!nombre || !email || !telefono || !direccion) {
      throw new ErrorServicio(
        400,
        "Nombre, email, teléfono y dirección son obligatorios",
      );
    }

    if (nombre.length < 2) {
      throw new ErrorServicio(
        400,
        "El nombre debe contener al menos 2 caracteres",
      );
    }

    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(email)) {
      throw new ErrorServicio(400, "El email no tiene un formato válido");
    }

    const formatoTelefono = /^[+\d\s()-]+$/;

    if (!formatoTelefono.test(telefono)) {
      throw new ErrorServicio(
        400,
        "El teléfono solo puede contener números, espacios, paréntesis, guiones y el signo +",
      );
    }

    const cantidadDigitos = telefono.replace(/\D/g, "").length;

    if (cantidadDigitos < 8 || cantidadDigitos > 15) {
      throw new ErrorServicio(
        400,
        "El teléfono debe contener entre 8 y 15 dígitos",
      );
    }

    if (direccion.length < 3) {
      throw new ErrorServicio(
        400,
        "La dirección debe contener al menos 3 caracteres",
      );
    }

    return {
      nombre,
      email,
      telefono,
      direccion,
    };
  }

  private static comprobarEmailDisponible(email: string, ignorarId?: number) {
    const existente = ignorarId
      ? db
          .select()
          .from(clientes)
          .where(
            sql`
              LOWER(${clientes.email}) = LOWER(${email})
              AND ${ne(clientes.id, ignorarId)}
            `,
          )
          .get()
      : db
          .select()
          .from(clientes)
          .where(sql`LOWER(${clientes.email}) = LOWER(${email})`)
          .get();

    if (existente) {
      throw new ErrorServicio(409, "Ya existe un cliente con ese email");
    }
  }

    private static validarDatosActividad(datos: DatosActividad) {
    const descripcion = datos.descripcion?.trim();
    const fecha = datos.fecha?.trim() || null;

    if (!descripcion) {
      throw new ErrorServicio(
        400,
        "La descripción de la actividad es obligatoria",
      );
    }

    if (descripcion.length < 3) {
      throw new ErrorServicio(
        400,
        "La descripción debe contener al menos 3 caracteres",
      );
    }

    return {
      descripcion,
      fecha,
    };
  }

private static obtenerActividadPorId(id: number) {
  const actividad = db
    .select()
    .from(actividades)
    .where(eq(actividades.id, id))
    .get();

  if (!actividad) {
    throw new ErrorServicio(404, "Actividad no encontrada");
  }

  return actividad;
}

  static listar(buscar?: string) {
    const texto = buscar?.trim();

    if (!texto) {
      return db.select().from(clientes).all();
    }

    const patron = `%${texto}%`;

    return db
      .select()
      .from(clientes)
      .where(sql`
        CAST(${clientes.id} AS TEXT) LIKE ${patron}
        OR ${clientes.nombre} LIKE ${patron}
        OR ${clientes.email} LIKE ${patron}
        OR ${clientes.telefono} LIKE ${patron}
        OR ${clientes.direccion} LIKE ${patron}
        OR ${clientes.creadoEn} LIKE ${patron}
      `)
      .all();
  }

  static obtenerPorId(id: number) {
    const cliente = db
      .select()
      .from(clientes)
      .where(eq(clientes.id, id))
      .get();

    if (!cliente) {
      throw new ErrorServicio(404, "Cliente no encontrado");
    }

    return cliente;
  }

  static crear(datos: DatosCliente) {
    const datosValidados = this.validarDatos(datos);

    this.comprobarEmailDisponible(datosValidados.email);

    return db
      .insert(clientes)
      .values({
        ...datosValidados,
        creadoEn: new Date().toISOString(),
      })
      .returning()
      .get();
  }

  static editar(id: number, datos: DatosCliente) {
    this.obtenerPorId(id);

    const datosValidados = this.validarDatos(datos);

    this.comprobarEmailDisponible(datosValidados.email, id);

    return db
      .update(clientes)
      .set(datosValidados)
      .where(eq(clientes.id, id))
      .returning()
      .get();
  }

  static eliminar(id: number) {
    const cliente = this.obtenerPorId(id);

    db.delete(clientes).where(eq(clientes.id, id)).run();

    return cliente;
  }

  static listarActividades(clienteId: number) {
  this.obtenerPorId(clienteId);

  return db
    .select()
    .from(actividades)
    .where(eq(actividades.clienteId, clienteId))
    .all();
}

static crearActividad(clienteId: number, datos: DatosActividad) {
  this.obtenerPorId(clienteId);

  const datosValidados = this.validarDatosActividad(datos);

  return db
    .insert(actividades)
    .values({
      clienteId,
      ...datosValidados,
      completada: false,
      completadaEn: null,
      creadaEn: new Date().toISOString(),
    })
    .returning()
    .get();
}

static editarActividad(id: number, datos: DatosActividad) {
  const actividad = this.obtenerActividadPorId(id);

  if (actividad.completada) {
    throw new ErrorServicio(
      409,
      "Una actividad completada no puede editarse",
    );
  }

  const datosValidados = this.validarDatosActividad(datos);

  return db
    .update(actividades)
    .set(datosValidados)
    .where(
      and(
        eq(actividades.id, id),
        eq(actividades.completada, false),
      ),
    )
    .returning()
    .get();
}

static completarActividad(id: number) {
  const actividad = this.obtenerActividadPorId(id);

  if (actividad.completada) {
    throw new ErrorServicio(409, "La actividad ya está completada");
  }

  return db
    .update(actividades)
    .set({
      completada: true,
      completadaEn: new Date().toISOString(),
    })
    .where(
      and(
        eq(actividades.id, id),
        eq(actividades.completada, false),
      ),
    )
    .returning()
    .get();
}

static eliminarActividad(id: number) {
  const actividad = this.obtenerActividadPorId(id);

  if (actividad.completada) {
    throw new ErrorServicio(
      409,
      "Una actividad completada no puede eliminarse individualmente",
    );
  }

  db.delete(actividades)
    .where(
      and(
        eq(actividades.id, id),
        eq(actividades.completada, false),
      ),
    )
    .run();

  return actividad;
}

}