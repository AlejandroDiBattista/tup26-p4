const { and, asc, desc, eq, or, sql } = require("drizzle-orm");
const { actividades, clientes } = require("../db/schema");
const { db } = require("../db");
const { ErrorAplicacion } = require("./Errores");

const camposCliente = ["nombre", "email", "telefono", "direccion"];

function validarId(valor, recurso) {
  const texto = String(valor);
  if (!/^[1-9]\d*$/.test(texto)) {
    throw new ErrorAplicacion(`El identificador de ${recurso} no es válido.`);
  }

  const id = Number(texto);
  if (!Number.isSafeInteger(id)) {
    throw new ErrorAplicacion(`El identificador de ${recurso} no es válido.`);
  }

  return id;
}

function validarObjeto(datos, camposPermitidos) {
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    throw new ErrorAplicacion("El cuerpo de la solicitud debe ser un objeto.");
  }

  const desconocidos = Object.keys(datos).filter(
    (campo) => !camposPermitidos.includes(campo),
  );
  if (desconocidos.length > 0) {
    throw new ErrorAplicacion(
      `Campos no permitidos: ${desconocidos.join(", ")}.`,
    );
  }
}

function normalizarTexto(datos, campo, maximo, obligatorio = false) {
  if (!Object.hasOwn(datos, campo)) {
    if (obligatorio) {
      throw new ErrorAplicacion(`El campo ${campo} es obligatorio.`);
    }
    return undefined;
  }

  const valor = datos[campo];
  if (valor === null && !obligatorio) {
    return null;
  }
  if (typeof valor !== "string") {
    throw new ErrorAplicacion(`El campo ${campo} debe ser texto.`);
  }

  const texto = valor.trim();
  if (texto.length === 0) {
    if (obligatorio) {
      throw new ErrorAplicacion(`El campo ${campo} es obligatorio.`);
    }
    return null;
  }
  if (texto.length > maximo) {
    throw new ErrorAplicacion(
      `El campo ${campo} no puede superar ${maximo} caracteres.`,
    );
  }

  return texto;
}

function validarCliente(datos, parcial = false) {
  validarObjeto(datos, camposCliente);

  const cliente = {};
  for (const campo of camposCliente) {
    if (parcial && !Object.hasOwn(datos, campo)) {
      continue;
    }

    const valor = normalizarTexto(
      datos,
      campo,
      campo === "nombre"
        ? 120
        : campo === "email"
          ? 254
          : campo === "telefono"
            ? 40
            : 250,
      campo === "nombre",
    );

    if (valor !== undefined) {
      cliente[campo] = valor;
    }
  }

  if (
    cliente.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email)
  ) {
    throw new ErrorAplicacion("El correo electrónico no es válido.");
  }
  if (parcial && Object.keys(cliente).length === 0) {
    throw new ErrorAplicacion("Indica al menos un campo para actualizar.");
  }

  return cliente;
}

function validarFecha(fecha) {
  if (fecha === undefined || fecha === null || fecha === "") {
    return null;
  }
  if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new ErrorAplicacion("La fecha debe tener el formato AAAA-MM-DD.");
  }

  const fechaParseada = new Date(`${fecha}T00:00:00.000Z`);
  if (
    Number.isNaN(fechaParseada.getTime()) ||
    fechaParseada.toISOString().slice(0, 10) !== fecha
  ) {
    throw new ErrorAplicacion("La fecha indicada no es válida.");
  }
  return fecha;
}

function validarActividad(datos, parcial = false) {
  validarObjeto(datos, ["descripcion", "fecha"]);

  const actividad = {};
  if (!parcial || Object.hasOwn(datos, "descripcion")) {
    actividad.descripcion = normalizarTexto(
      datos,
      "descripcion",
      500,
      true,
    );
  }
  if (!parcial || Object.hasOwn(datos, "fecha")) {
    actividad.fecha = validarFecha(datos.fecha);
  }
  if (parcial && Object.keys(actividad).length === 0) {
    throw new ErrorAplicacion("Indica al menos un campo para actualizar.");
  }

  return actividad;
}

function escaparBusqueda(texto) {
  return texto.replace(/[\\%_]/g, "\\$&");
}

class Clientes {
  static async obtenerTodos(busqueda = "") {
    if (typeof busqueda !== "string" || busqueda.length > 100) {
      throw new ErrorAplicacion(
        "La búsqueda debe ser texto de hasta 100 caracteres.",
      );
    }

    const termino = busqueda.trim();
    if (!termino) {
      return db.select().from(clientes).orderBy(asc(clientes.nombre));
    }

    const patron = `%${escaparBusqueda(termino).toLowerCase()}%`;
    const columnas = [
      clientes.nombre,
      clientes.email,
      clientes.telefono,
      clientes.direccion,
    ];
    const coincidencias = columnas.map(
      (columna) => sql`lower(${columna}) LIKE ${patron} ESCAPE '\\'`,
    );

    return db
      .select()
      .from(clientes)
      .where(or(...coincidencias))
      .orderBy(asc(clientes.nombre));
  }

  static async obtenerPorId(valorId) {
    const id = validarId(valorId, "cliente");
    const [cliente] = await db
      .select()
      .from(clientes)
      .where(eq(clientes.id, id))
      .limit(1);

    if (!cliente) {
      throw new ErrorAplicacion("No se encontró el cliente.", 404);
    }
    return cliente;
  }

  static async crear(datos) {
    const nuevoCliente = validarCliente(datos);
    const [cliente] = await db
      .insert(clientes)
      .values(nuevoCliente)
      .returning();
    return cliente;
  }

  static async actualizar(valorId, datos) {
    const id = validarId(valorId, "cliente");
    const cambios = validarCliente(datos, true);
    const [cliente] = await db
      .update(clientes)
      .set(cambios)
      .where(eq(clientes.id, id))
      .returning();

    if (!cliente) {
      throw new ErrorAplicacion("No se encontró el cliente.", 404);
    }
    return cliente;
  }

  static async eliminar(valorId) {
    const id = validarId(valorId, "cliente");
    const [cliente] = await db
      .delete(clientes)
      .where(eq(clientes.id, id))
      .returning({ id: clientes.id });

    if (!cliente) {
      throw new ErrorAplicacion("No se encontró el cliente.", 404);
    }
  }

  static async obtenerActividades(valorClienteId) {
    const clienteId = validarId(valorClienteId, "cliente");
    await this.obtenerPorId(clienteId);

    return db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, clienteId))
      .orderBy(
        asc(actividades.completada),
        asc(actividades.fecha),
        desc(actividades.id),
      );
  }

  static async crearActividad(valorClienteId, datos) {
    const clienteId = validarId(valorClienteId, "cliente");
    await this.obtenerPorId(clienteId);
    const nuevaActividad = validarActividad(datos);
    const [actividad] = await db
      .insert(actividades)
      .values({ ...nuevaActividad, clienteId })
      .returning();
    return actividad;
  }

  static async actualizarActividad(valorId, datos) {
    const id = validarId(valorId, "actividad");
    const cambios = validarActividad(datos, true);
    const [actividad] = await db
      .update(actividades)
      .set(cambios)
      .where(and(eq(actividades.id, id), eq(actividades.completada, false)))
      .returning();
    if (actividad) {
      return actividad;
    }

    const [existente] = await db
      .select({ id: actividades.id })
      .from(actividades)
      .where(eq(actividades.id, id))
      .limit(1);
    if (!existente) {
      throw new ErrorAplicacion("No se encontró la actividad.", 404);
    }
    throw new ErrorAplicacion(
      "No se puede modificar una actividad completada.",
      409,
    );
  }

  static async completarActividad(valorId) {
    const id = validarId(valorId, "actividad");
    const [actividad] = await db
      .update(actividades)
      .set({
        completada: true,
        fechaCompletada: new Date().toISOString(),
      })
      .where(and(eq(actividades.id, id), eq(actividades.completada, false)))
      .returning();

    if (actividad) {
      return actividad;
    }

    const [existente] = await db
      .select({ completada: actividades.completada })
      .from(actividades)
      .where(eq(actividades.id, id))
      .limit(1);

    if (!existente) {
      throw new ErrorAplicacion("No se encontró la actividad.", 404);
    }
    throw new ErrorAplicacion("La actividad ya está completada.", 409);
  }

  static async eliminarActividad(valorId) {
    const id = validarId(valorId, "actividad");
    const [actividadEliminada] = await db
      .delete(actividades)
      .where(and(eq(actividades.id, id), eq(actividades.completada, false)))
      .returning({ id: actividades.id });
    if (actividadEliminada) {
      return;
    }

    const [actividadExistente] = await db
      .select({ id: actividades.id })
      .from(actividades)
      .where(eq(actividades.id, id))
      .limit(1);
    if (!actividadExistente) {
      throw new ErrorAplicacion("No se encontró la actividad.", 404);
    }
    throw new ErrorAplicacion(
      "No se puede eliminar una actividad completada.",
      409,
    );
  }
}

module.exports = { Clientes };
