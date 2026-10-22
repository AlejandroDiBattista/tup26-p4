import { and, eq, isNull, like, lt, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { actividades, clientes } from "../db/schema.js";

export class Clientes {

private static normalizarTexto(texto: string) {
  return texto.trim().replace(/\s+/g, " ");
}

private static normalizarNombre(texto: string) {
  return this.normalizarTexto(texto)
    .toLowerCase()
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

private static normalizarEmail(email: string) {
  return email.trim().toLowerCase();
}

private static normalizarTelefono(telefono: string | null | undefined) {
  if (!telefono) {
    return telefono;
  }

  return telefono.replace(/\s+/g, "").trim();
}

    static listar() {
    return db.select().from(clientes);
  }

  static listarActividades(clienteId: number) {
    return db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, clienteId));
  }

  static crearActividad(datos: typeof actividades.$inferInsert) {
    return db
      .insert(actividades)
      .values(datos)
      .returning()
      .get();
  }


  static actualizarActividad(
    id: number,
    datos: Partial<typeof actividades.$inferInsert>
  ) {
    const actividad = db
      .select()
      .from(actividades)
      .where(eq(actividades.id, id))
      .get();

    if (!actividad) {
      return undefined;
    }

    if (actividad.fechaFinalizacion) {
      throw new Error("No se puede modificar una actividad finalizada");
    }

    return db
      .update(actividades)
      .set(datos)
      .where(eq(actividades.id, id))
      .returning()
      .get();
  }

    static eliminarActividad(id: number) {
    const actividad = db
      .select()
      .from(actividades)
      .where(eq(actividades.id, id))
      .get();

    if (!actividad) {
      return undefined;
    }

    if (actividad.fechaFinalizacion) {
      throw new Error("No se puede eliminar una actividad finalizada");
    }

    return db
      .delete(actividades)
      .where(eq(actividades.id, id))
      .returning()
      .get();
  }

    static completarActividad(id: number) {
    const actividad = db
      .select()
      .from(actividades)
      .where(eq(actividades.id, id))
      .get();

    if (!actividad) {
      return undefined;
    }

    if (actividad.fechaFinalizacion) {
      throw new Error("La actividad ya está finalizada");
    }

    const hoy = new Date().toISOString().slice(0, 10);

    return db
      .update(actividades)
      .set({
        fechaFinalizacion: hoy,
      })
      .where(eq(actividades.id, id))
      .returning()
      .get();
  }

    static listarVencidas() {
    const hoy = new Date().toISOString().slice(0, 10);

    return db
      .select()
      .from(actividades)
      .where(
        and(
          like(actividades.fechaCompromiso, "%"),
          lt(actividades.fechaCompromiso, hoy),
          isNull(actividades.fechaFinalizacion)
        )
      );
  }


static obtenerPorId(id: number) {
  return db
    .select()
    .from(clientes)
    .where(eq(clientes.id, id))
    .get();
}

static crear(datos: typeof clientes.$inferInsert) {
  return db
    .insert(clientes)
    .values({
      ...datos,
      nombre: this.normalizarNombre(datos.nombre),
      apellido: this.normalizarNombre(datos.apellido),
      email: this.normalizarEmail(datos.email),
      domicilio: datos.domicilio
        ? this.normalizarTexto(datos.domicilio)
        : datos.domicilio,
      localidad: datos.localidad
        ? this.normalizarTexto(datos.localidad)
        : datos.localidad,
      telefono: this.normalizarTelefono(datos.telefono),
    })
    .returning()
    .get();
}


static actualizar(
  id: number,
  datos: Partial<typeof clientes.$inferInsert>
) {
  return db
    .update(clientes)
    .set({
      ...datos,
      ...(datos.nombre !== undefined && {
        nombre: this.normalizarNombre(datos.nombre),
      }),
      ...(datos.apellido !== undefined && {
        apellido: this.normalizarNombre(datos.apellido),
      }),
      ...(datos.email !== undefined && {
        email: this.normalizarEmail(datos.email),
      }),
      ...(datos.domicilio !== undefined && {
        domicilio: datos.domicilio
          ? this.normalizarTexto(datos.domicilio)
          : datos.domicilio,
      }),
      ...(datos.localidad !== undefined && {
        localidad: datos.localidad
          ? this.normalizarTexto(datos.localidad)
          : datos.localidad,
      }),
      ...(datos.telefono !== undefined && {
        telefono: this.normalizarTelefono(datos.telefono),
      }),
    })
    .where(eq(clientes.id, id))
    .returning()
    .get();
}

static eliminar(id: number) {
  return db
    .delete(clientes)
    .where(eq(clientes.id, id))
    .returning()
    .get();
}


static buscar(texto: string) {
  const termino = `%${texto}%`;
  const id = Number(texto);

  return db
    .select()
    .from(clientes)
    .where(
      or(
        like(clientes.nombre, termino),
        like(clientes.apellido, termino),
        like(clientes.email, termino),
        like(clientes.domicilio, termino),
        like(clientes.localidad, termino),
        like(clientes.telefono, termino),
        !Number.isNaN(id) ? eq(clientes.id, id) : undefined
      )
    );
}
}

