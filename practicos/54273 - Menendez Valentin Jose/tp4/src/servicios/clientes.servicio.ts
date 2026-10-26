import { and, asc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  clientes,
  actividades,
  type Cliente,
  type NuevoCliente,
  type Actividad,
  type NuevaActividad,
} from '../db/esquema.js';

export type ClienteConActividades = Cliente & {
  actividades: Actividad[];
};

export class ErrorNegocio extends Error {
  codigo: number;

  constructor(mensaje: string, codigo = 400) {
    super(mensaje);
    this.name = 'ErrorNegocio';
    this.codigo = codigo;
  }
}

function normalizarTexto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : '';
}

function normalizarOpcional(valor: unknown): string | null {
  if (valor === undefined || valor === null) return null;
  const limpio = normalizarTexto(valor);
  return limpio.length > 0 ? limpio : null;
}

function normalizarFecha(valor: unknown): string | null {
  const fecha = normalizarOpcional(valor);
  if (!fecha) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new ErrorNegocio('Formato de fecha inválido. Use YYYY-MM-DD', 400);
  }
  return fecha;
}

function obtenerFechaLocalHoy(): string {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function quitarAcentos(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function coincideCampo(valor: string | number | null | undefined, termino: string): boolean {
  if (valor === null || valor === undefined) return false;
  const texto = String(valor);
  return (
    texto.toLowerCase().includes(termino.toLowerCase()) ||
    quitarAcentos(texto).includes(quitarAcentos(termino))
  );
}

export class Clientes {
  static listar(busqueda?: string): ClienteConActividades[] {
    const listaClientes = db
      .select()
      .from(clientes)
      .orderBy(asc(clientes.apellido), asc(clientes.nombre))
      .all();

    const todasActividades = db.select().from(actividades).all();
    const mapaActividades = new Map<number, Actividad[]>();

    for (const act of todasActividades) {
      const grupo = mapaActividades.get(act.clienteId) ?? [];
      grupo.push(act);
      mapaActividades.set(act.clienteId, grupo);
    }

    const clientesCompletos: ClienteConActividades[] = listaClientes.map((c) => ({
      ...c,
      actividades: mapaActividades.get(c.id) ?? [],
    }));

    const termino = normalizarTexto(busqueda);
    if (!termino) {
      return clientesCompletos;
    }

    const terminoId = termino.startsWith('#') ? termino.slice(1) : termino;

    return clientesCompletos.filter((c) => {
      const nombreCompleto = `${c.nombre} ${c.apellido}`;
      const apellidoNombre = `${c.apellido} ${c.nombre}`;

      const coincideCliente =
        (terminoId.length > 0 && coincideCampo(c.id, terminoId)) ||
        coincideCampo(c.nombre, termino) ||
        coincideCampo(c.apellido, termino) ||
        coincideCampo(nombreCompleto, termino) ||
        coincideCampo(apellidoNombre, termino) ||
        coincideCampo(c.email, termino) ||
        coincideCampo(c.telefono, termino) ||
        coincideCampo(c.domicilio, termino) ||
        coincideCampo(c.localidad, termino);

      if (coincideCliente) return true;

      return c.actividades.some((act) => coincideCampo(act.descripcion, termino));
    });
  }

  static obtenerPorId(id: number): ClienteConActividades | null {
    if (!Number.isInteger(id) || id <= 0) return null;

    const cliente = db.select().from(clientes).where(eq(clientes.id, id)).get();
    if (!cliente) return null;

    const listaActividades = db
      .select()
      .from(actividades)
      .where(eq(actividades.clienteId, id))
      .all();

    return {
      ...cliente,
      actividades: listaActividades,
    };
  }

  static crear(datos: Partial<NuevoCliente>): ClienteConActividades {
    if (!datos || typeof datos !== 'object') {
      throw new ErrorNegocio('Los datos del cliente son inválidos', 400);
    }

    const nombre = normalizarTexto(datos.nombre);
    const apellido = normalizarTexto(datos.apellido);
    const email = normalizarTexto(datos.email).toLowerCase();

    if (!nombre) {
      throw new ErrorNegocio('El nombre es obligatorio', 400);
    }
    if (!apellido) {
      throw new ErrorNegocio('El apellido es obligatorio', 400);
    }
    if (!email || !email.includes('@')) {
      throw new ErrorNegocio('El email es obligatorio y debe ser válido', 400);
    }

    const valores: NuevoCliente = {
      nombre,
      apellido,
      email,
      telefono: normalizarOpcional(datos.telefono),
      domicilio: normalizarOpcional(datos.domicilio),
      localidad: normalizarOpcional(datos.localidad),
    };

    const clienteCreado = db.insert(clientes).values(valores).returning().get();

    return {
      ...clienteCreado,
      actividades: [],
    };
  }

  static actualizar(id: number, datos: Partial<NuevoCliente>): ClienteConActividades {
    const existente = this.obtenerPorId(id);
    if (!existente) {
      throw new ErrorNegocio('Cliente no encontrado', 404);
    }

    if (!datos || typeof datos !== 'object') {
      throw new ErrorNegocio('Los datos del cliente son inválidos', 400);
    }

    const nombre = normalizarTexto(datos.nombre);
    const apellido = normalizarTexto(datos.apellido);
    const email = normalizarTexto(datos.email).toLowerCase();

    if (!nombre) {
      throw new ErrorNegocio('El nombre es obligatorio', 400);
    }
    if (!apellido) {
      throw new ErrorNegocio('El apellido es obligatorio', 400);
    }
    if (!email || !email.includes('@')) {
      throw new ErrorNegocio('El email es obligatorio y debe ser válido', 400);
    }

    db.update(clientes)
      .set({
        nombre,
        apellido,
        email,
        telefono: normalizarOpcional(datos.telefono),
        domicilio: normalizarOpcional(datos.domicilio),
        localidad: normalizarOpcional(datos.localidad),
      })
      .where(eq(clientes.id, id))
      .run();

    return this.obtenerPorId(id)!;
  }

  static eliminar(id: number): boolean {
    const existente = this.obtenerPorId(id);
    if (!existente) {
      throw new ErrorNegocio('Cliente no encontrado', 404);
    }

    db.delete(clientes).where(eq(clientes.id, id)).run();
    return true;
  }

  static agregarActividad(
    clienteId: number,
    datos: Partial<Pick<NuevaActividad, 'descripcion' | 'fechaCompromiso'>>
  ): Actividad {
    const cliente = this.obtenerPorId(clienteId);
    if (!cliente) {
      throw new ErrorNegocio('Cliente no encontrado', 404);
    }

    if (!datos || typeof datos !== 'object') {
      throw new ErrorNegocio('Los datos de la actividad son inválidos', 400);
    }

    const descripcion = normalizarTexto(datos.descripcion);
    if (!descripcion) {
      throw new ErrorNegocio('La descripción de la actividad es obligatoria', 400);
    }

    const fechaCompromiso = normalizarFecha(datos.fechaCompromiso);

    return db
      .insert(actividades)
      .values({
        clienteId,
        descripcion,
        fechaCompromiso,
        fechaFinalizacion: null,
      })
      .returning()
      .get();
  }

  static actualizarActividad(
    clienteId: number,
    actividadId: number,
    datos: Partial<Pick<NuevaActividad, 'descripcion' | 'fechaCompromiso'>>
  ): Actividad {
    if (!Number.isInteger(clienteId) || !Number.isInteger(actividadId)) {
      throw new ErrorNegocio('Identificadores inválidos', 400);
    }

    const actividad = db
      .select()
      .from(actividades)
      .where(and(eq(actividades.id, actividadId), eq(actividades.clienteId, clienteId)))
      .get();

    if (!actividad) {
      throw new ErrorNegocio('Actividad no encontrada para este cliente', 404);
    }

    if (actividad.fechaFinalizacion !== null) {
      throw new ErrorNegocio('No se puede editar una actividad completada', 400);
    }

    if (!datos || typeof datos !== 'object') {
      throw new ErrorNegocio('Los datos de la actividad son inválidos', 400);
    }

    const descripcion = normalizarTexto(datos.descripcion);
    if (!descripcion) {
      throw new ErrorNegocio('La descripción de la actividad es obligatoria', 400);
    }

    const fechaCompromiso = normalizarFecha(datos.fechaCompromiso);

    return db
      .update(actividades)
      .set({
        descripcion,
        fechaCompromiso,
      })
      .where(eq(actividades.id, actividadId))
      .returning()
      .get();
  }

  static completarActividad(clienteId: number, actividadId: number): Actividad {
    if (!Number.isInteger(clienteId) || !Number.isInteger(actividadId)) {
      throw new ErrorNegocio('Identificadores inválidos', 400);
    }

    const actividad = db
      .select()
      .from(actividades)
      .where(and(eq(actividades.id, actividadId), eq(actividades.clienteId, clienteId)))
      .get();

    if (!actividad) {
      throw new ErrorNegocio('Actividad no encontrada para este cliente', 404);
    }

    if (actividad.fechaFinalizacion !== null) {
      return actividad;
    }

    const hoy = obtenerFechaLocalHoy();

    return db
      .update(actividades)
      .set({ fechaFinalizacion: hoy })
      .where(eq(actividades.id, actividadId))
      .returning()
      .get();
  }

  static eliminarActividad(clienteId: number, actividadId: number): boolean {
    if (!Number.isInteger(clienteId) || !Number.isInteger(actividadId)) {
      throw new ErrorNegocio('Identificadores inválidos', 400);
    }

    const actividad = db
      .select()
      .from(actividades)
      .where(and(eq(actividades.id, actividadId), eq(actividades.clienteId, clienteId)))
      .get();

    if (!actividad) {
      throw new ErrorNegocio('Actividad no encontrada para este cliente', 404);
    }

    if (actividad.fechaFinalizacion !== null) {
      throw new ErrorNegocio('No se puede eliminar una actividad completada', 400);
    }

    db.delete(actividades).where(eq(actividades.id, actividadId)).run();
    return true;
  }
}
