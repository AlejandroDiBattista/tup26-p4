// Importamos los operadores de consulta de Drizzle ORM
import { asc, eq, like, or, sql } from "drizzle-orm";

// Importamos la conexión a la base de datos
import { db } from "../db/index.js";

// Importamos las definiciones de tablas y los tipos
import { actividades, clientes, type Actividad, type Cliente, type NuevoCliente } from "../db/schema.js";

// ============================================================================
// CLASE DE SERVICIO: Clientes
// Contiene toda la lógica de negocio y métodos estáticos CRUD solicitados
// ============================================================================
export class Clientes {

  // --------------------------------------------------------------------------
  // 1. BÚSQUEDA FLEXIBLE DE CLIENTES
  // Permite filtrar por cualquier campo o devolver todos si el término está vacío
  // --------------------------------------------------------------------------
  static async buscar(termino = ""): Promise<Cliente[]> {
    // Quitamos los espacios en blanco sobrantes del texto buscado
    const texto = termino.trim();

    // Si no se ingresó nada en la búsqueda, devolvemos todos los clientes ordenados por apellido y nombre
    if (!texto) {
      return db
        .select()
        .from(clientes)
        .orderBy(asc(clientes.apellido), asc(clientes.nombre));
    }

    // Armamos el patrón para SQL LIKE con comodines % al inicio y al final
    const patron = `%${texto}%`;

    // Realizamos la consulta buscando coincidencias parciales en cualquiera de los campos
    return db
      .select()
      .from(clientes)
      .where(
        or(
          like(clientes.nombre, patron),
          like(clientes.apellido, patron),
          like(clientes.email, patron),
          like(clientes.domicilio, patron),
          like(clientes.localidad, patron),
          like(clientes.telefono, patron),
          like(sql`cast(${clientes.id} as text)`, patron) // Permite buscar también por número de ID
        )
      )
      .orderBy(asc(clientes.apellido), asc(clientes.nombre));
  }

  // --------------------------------------------------------------------------
  // 2. OBTENER UN CLIENTE POR SU IDENTIFICADOR (ID)
  // --------------------------------------------------------------------------
  static async obtenerPorId(id: number): Promise<Cliente | null> {
    // Ejecutamos la consulta filtrando por el ID exacto
    const filas = await db
      .select()
      .from(clientes)
      .where(eq(clientes.id, id));

    // Si encontramos una fila retornamos el cliente, si no null
    return filas[0] ?? null;
  }

  // --------------------------------------------------------------------------
  // 3. CREAR UN NUEVO CLIENTE
  // Valida campos obligatorios y que no se duplique el correo electrónico
  // --------------------------------------------------------------------------
  static async crear(datos: Omit<NuevoCliente, "id">): Promise<Cliente> {
    // Validamos que el nombre no esté vacío
    if (!datos.nombre || !datos.nombre.trim()) {
      throw new Error("El nombre es obligatorio");
    }

    // Validamos que el apellido no esté vacío
    if (!datos.apellido || !datos.apellido.trim()) {
      throw new Error("El apellido es obligatorio");
    }

    // Validamos que el email no esté vacío
    if (!datos.email || !datos.email.trim()) {
      throw new Error("El email es obligatorio");
    }

    // Convertimos el email a minúsculas y sin espacios para evitar duplicados accidentales
    const emailNormalizado = datos.email.trim().toLowerCase();

    // Verificamos si ya existe algún cliente registrado con este mismo email
    const [existente] = await db
      .select()
      .from(clientes)
      .where(eq(clientes.email, emailNormalizado));

    if (existente) {
      throw new Error("Ya existe un cliente con ese email");
    }

    // Armamos el objeto limpio a insertar
    const nuevo = {
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      email: emailNormalizado,
      domicilio: datos.domicilio ? datos.domicilio.trim() : null,
      localidad: datos.localidad ? datos.localidad.trim() : null,
      telefono: datos.telefono ? datos.telefono.trim() : null,
    };

    // Insertamos el registro en la tabla clientes y retornamos el registro creado
    const [clienteCreado] = await db.insert(clientes).values(nuevo).returning();
    return clienteCreado;
  }

  // --------------------------------------------------------------------------
  // 4. ACTUALIZAR LOS DATOS DE UN CLIENTE EXISTENTE
  // --------------------------------------------------------------------------
  static async actualizar(id: number, datos: Partial<Omit<NuevoCliente, "id">>): Promise<Cliente> {
    // Verificamos primero si el cliente a modificar existe en la base
    const actual = await this.obtenerPorId(id);
    if (!actual) {
      throw new Error("Cliente no encontrado");
    }

    // Si se envió un nuevo email, comprobamos que no pertenezca a otro cliente
    if (datos.email) {
      const emailNormalizado = datos.email.trim().toLowerCase();
      const [otroConMismoEmail] = await db
        .select()
        .from(clientes)
        .where(eq(clientes.email, emailNormalizado));

      if (otroConMismoEmail && otroConMismoEmail.id !== id) {
        throw new Error("Ya existe otro cliente con ese email");
      }
    }

    // Construimos solo los campos que cambiaron
    const camposParaActualizar: Partial<Omit<NuevoCliente, "id">> = {};
    if (datos.nombre !== undefined) camposParaActualizar.nombre = datos.nombre.trim();
    if (datos.apellido !== undefined) camposParaActualizar.apellido = datos.apellido.trim();
    if (datos.email !== undefined) camposParaActualizar.email = datos.email.trim().toLowerCase();
    if (datos.domicilio !== undefined) camposParaActualizar.domicilio = datos.domicilio ? datos.domicilio.trim() : null;
    if (datos.localidad !== undefined) camposParaActualizar.localidad = datos.localidad ? datos.localidad.trim() : null;
    if (datos.telefono !== undefined) camposParaActualizar.telefono = datos.telefono ? datos.telefono.trim() : null;

    // Ejecutamos el update en la base de datos
    const [clienteActualizado] = await db
      .update(clientes)
      .set(camposParaActualizar)
      .where(eq(clientes.id, id))
      .returning();

    return clienteActualizado;
  }

  // --------------------------------------------------------------------------
  // 5. ELIMINAR UN CLIENTE
  // Sus actividades se eliminan automáticamente por la regla ON DELETE CASCADE
  // --------------------------------------------------------------------------
  static async eliminar(id: number): Promise<boolean> {
    // Verificamos si el cliente existe
    const actual = await this.obtenerPorId(id);
    if (!actual) {
      throw new Error("Cliente no encontrado");
    }

    // Eliminamos el cliente de la tabla
    await db.delete(clientes).where(eq(clientes.id, id));
    return true;
  }

  // --------------------------------------------------------------------------
  // 6. LISTAR LAS ACTIVIDADES DE UN CLIENTE
  // --------------------------------------------------------------------------
  static async listarActividades(clienteId: number): Promise<Actividad[]> {
    return db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, clienteId))
      .orderBy(asc(actividades.fechaFinalizacion), asc(actividades.fechaCompromiso));
  }

  // --------------------------------------------------------------------------
  // 7. CREAR UNA ACTIVIDAD PARA UN CLIENTE
  // --------------------------------------------------------------------------
  static async crearActividad(
    clienteId: number,
    datos: { descripcion: string; fechaCompromiso?: string | null }
  ): Promise<Actividad> {
    // Comprobamos que el cliente exista
    const cliente = await this.obtenerPorId(clienteId);
    if (!cliente) {
      throw new Error("Cliente no encontrado");
    }

    // Comprobamos que la descripción de la actividad no esté vacía
    if (!datos.descripcion || !datos.descripcion.trim()) {
      throw new Error("La descripción de la actividad es obligatoria");
    }

    // Insertamos la nueva actividad con fecha de finalización nula (pendiente)
    const [nuevaActividad] = await db
      .insert(actividades)
      .values({
        clienteId,
        descripcion: datos.descripcion.trim(),
        fechaCompromiso: datos.fechaCompromiso ? datos.fechaCompromiso.trim() : null,
        fechaFinalizacion: null,
      })
      .returning();

    return nuevaActividad;
  }

  // --------------------------------------------------------------------------
  // 8. ACTUALIZAR UNA ACTIVIDAD PENDIENTE
  // REQUISITO: Las actividades completadas no se pueden editar individualmente
  // --------------------------------------------------------------------------
  static async actualizarActividad(
    id: number,
    datos: { descripcion?: string; fechaCompromiso?: string | null }
  ): Promise<Actividad> {
    // Buscamos la actividad en la base de datos
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(eq(actividades.id, id));

    if (!actividad) {
      throw new Error("Actividad no encontrada");
    }

    // REGLA DE NEGOCIO: Si ya tiene fechaFinalizacion, está completada y no se permite editar
    if (actividad.fechaFinalizacion) {
      throw new Error("Las actividades completadas no se pueden editar ni borrar individualmente");
    }

    // Preparamos los campos a actualizar
    const camposParaActualizar: { descripcion?: string; fechaCompromiso?: string | null } = {};
    if (datos.descripcion !== undefined) {
      if (!datos.descripcion.trim()) throw new Error("La descripción no puede estar vacía");
      camposParaActualizar.descripcion = datos.descripcion.trim();
    }
    if (datos.fechaCompromiso !== undefined) {
      camposParaActualizar.fechaCompromiso = datos.fechaCompromiso ? datos.fechaCompromiso.trim() : null;
    }

    // Actualizamos en la base de datos
    const [actividadActualizada] = await db
      .update(actividades)
      .set(camposParaActualizar)
      .where(eq(actividades.id, id))
      .returning();

    return actividadActualizada;
  }

  // --------------------------------------------------------------------------
  // 9. COMPLETAR UNA ACTIVIDAD
  // Le asigna la fecha de hoy a 'fechaFinalizacion'
  // --------------------------------------------------------------------------
  static async completarActividad(id: number): Promise<Actividad> {
    // Buscamos la actividad por su ID
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(eq(actividades.id, id));

    if (!actividad) {
      throw new Error("Actividad no encontrada");
    }

    // Obtenemos la fecha actual en formato ISO YYYY-MM-DD
    const hoyIso = new Date().toISOString().split("T")[0];

    // Marcamos la actividad como completada guardando la fecha de hoy
    const [actividadCompletada] = await db
      .update(actividades)
      .set({ fechaFinalizacion: hoyIso })
      .where(eq(actividades.id, id))
      .returning();

    return actividadCompletada;
  }

  // --------------------------------------------------------------------------
  // 10. ELIMINAR UNA ACTIVIDAD PENDIENTE
  // REQUISITO: Las actividades completadas no se pueden borrar individualmente
  // --------------------------------------------------------------------------
  static async eliminarActividad(id: number): Promise<boolean> {
    // Buscamos la actividad por su ID
    const [actividad] = await db
      .select()
      .from(actividades)
      .where(eq(actividades.id, id));

    if (!actividad) {
      throw new Error("Actividad no encontrada");
    }

    // REGLA DE NEGOCIO: Si ya está completada, no permitimos borrarla
    if (actividad.fechaFinalizacion) {
      throw new Error("Las actividades completadas no se pueden editar ni borrar individualmente");
    }

    // Eliminamos la actividad de la tabla
    await db.delete(actividades).where(eq(actividades.id, id));
    return true;
  }
}
