import { and, eq } from 'drizzle-orm'
import { db } from '../db/conexion.js'
import { actividades, clientes, type Actividad, type Cliente, type NuevaActividad, type NuevoCliente } from '../db/esquema.js'
import { conflicto, invalido, noEncontrado } from './errores.js'

export type DatosCliente = Omit<NuevoCliente, 'id'>
export type DatosActividad = Pick<NuevaActividad, 'descripcion' | 'fechaCompromiso'>
export type ClienteConActividades = Cliente & { actividades: Actividad[] }

const CAMPOS_CLIENTE = ['nombre', 'apellido', 'email', 'domicilio', 'localidad', 'telefono'] as const
const hoy = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD en hora local
const sinAcentos = (t: string) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

// ---------- Normalización ----------
const texto = (v: unknown) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '')
const opcional = (v: unknown) => texto(v) || null
const capitalizar = (t: string) => t.toLowerCase().replace(/(^|[\s'-])\p{L}/gu, (m) => m.toUpperCase())
const telefono = (v: unknown) => {
  const t = texto(v)
  return t ? t.replace(/[^\d+]/g, '') : null
}

function normalizarCliente(d: Partial<DatosCliente>): DatosCliente {
  const nombre = capitalizar(texto(d.nombre))
  const apellido = capitalizar(texto(d.apellido))
  const email = texto(d.email).toLowerCase()
  if (!nombre) throw invalido('El nombre es obligatorio')
  if (!apellido) throw invalido('El apellido es obligatorio')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw invalido('El email no es válido')
  return {
    nombre,
    apellido,
    email,
    domicilio: opcional(d.domicilio),
    localidad: opcional(d.localidad),
    telefono: telefono(d.telefono),
  }
}

function normalizarActividad(d: Partial<DatosActividad>): DatosActividad {
  const descripcion = texto(d.descripcion)
  if (!descripcion) throw invalido('La descripción es obligatoria')
  const fecha = opcional(d.fechaCompromiso)
  if (fecha && (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(Date.parse(fecha)))) {
    throw invalido('La fecha de compromiso debe tener formato AAAA-MM-DD')
  }
  return { descripcion, fechaCompromiso: fecha }
}

function emailRepetido(error: unknown): never {
  if (error instanceof Error && 'code' in error && String(error.code).startsWith('SQLITE_CONSTRAINT')) {
    throw conflicto('Ya existe un cliente con ese email')
  }
  throw error
}

export class Clientes {
  // ---------- Clientes ----------

  /**
   * Búsqueda flexible. `q` busca texto parcial (sin acentos ni mayúsculas) en cualquier campo;
   * cualquier otro campo del cliente filtra solo por ese campo. Se combinan con AND.
   */
  static buscar(criterios: Record<string, string | undefined> = {}): Cliente[] {
    const { q, ...porCampo } = criterios
    for (const campo of Object.keys(porCampo)) {
      if (campo !== 'id' && !(CAMPOS_CLIENTE as readonly string[]).includes(campo)) {
        throw invalido(`Campo de búsqueda desconocido: ${campo}`)
      }
    }
    const coincide = (valor: unknown, buscado: string) => sinAcentos(String(valor ?? '')).includes(sinAcentos(buscado))

    return db
      .select()
      .from(clientes)
      .orderBy(clientes.apellido, clientes.nombre)
      .all()
      .filter((c) => {
        const registro = c as Record<string, unknown>
        const porTexto = !q?.trim() || Object.values(registro).some((v) => coincide(v, q.trim()))
        const porCampos = Object.entries(porCampo).every(([campo, v]) => !v?.trim() || coincide(registro[campo], v.trim()))
        return porTexto && porCampos
      })
  }

  static obtener(id: number): ClienteConActividades {
    const cliente = db.select().from(clientes).where(eq(clientes.id, id)).get()
    if (!cliente) throw noEncontrado('Cliente')
    return { ...cliente, actividades: Clientes.listarActividades(id) }
  }

  static crear(datos: Partial<DatosCliente>): ClienteConActividades {
    try {
      const { id } = db.insert(clientes).values(normalizarCliente(datos)).returning({ id: clientes.id }).get()
      return Clientes.obtener(id)
    } catch (e) {
      return emailRepetido(e)
    }
  }

  static actualizar(id: number, datos: Partial<DatosCliente>): ClienteConActividades {
    const actual = Clientes.obtener(id)
    try {
      db.update(clientes).set(normalizarCliente({ ...actual, ...datos })).where(eq(clientes.id, id)).run()
    } catch (e) {
      return emailRepetido(e)
    }
    return Clientes.obtener(id)
  }

  static eliminar(id: number): void {
    Clientes.obtener(id)
    db.delete(clientes).where(eq(clientes.id, id)).run() // las actividades caen en cascada
  }

  // ---------- Actividades ----------

  static listarActividades(clienteId: number): Actividad[] {
    return db.select().from(actividades).where(eq(actividades.clienteId, clienteId)).orderBy(actividades.id).all()
  }

  private static actividad(clienteId: number, id: number): Actividad {
    Clientes.obtener(clienteId)
    const actividad = db
      .select()
      .from(actividades)
      .where(and(eq(actividades.id, id), eq(actividades.clienteId, clienteId)))
      .get()
    if (!actividad) throw noEncontrado('Actividad')
    return actividad
  }

  static crearActividad(clienteId: number, datos: Partial<DatosActividad>): Actividad {
    Clientes.obtener(clienteId)
    return db
      .insert(actividades)
      .values({ ...normalizarActividad(datos), clienteId })
      .returning()
      .get()
  }

  static actualizarActividad(clienteId: number, id: number, datos: Partial<DatosActividad>): Actividad {
    const actual = Clientes.actividad(clienteId, id)
    if (actual.fechaFinalizacion) throw conflicto('Una actividad completada no se puede editar')
    return db
      .update(actividades)
      .set(normalizarActividad({ ...actual, ...datos }))
      .where(eq(actividades.id, id))
      .returning()
      .get()
  }

  static completarActividad(clienteId: number, id: number): Actividad {
    const actual = Clientes.actividad(clienteId, id)
    if (actual.fechaFinalizacion) throw conflicto('La actividad ya está completada')
    return db.update(actividades).set({ fechaFinalizacion: hoy() }).where(eq(actividades.id, id)).returning().get()
  }

  static eliminarActividad(clienteId: number, id: number): void {
    const actual = Clientes.actividad(clienteId, id)
    if (actual.fechaFinalizacion) throw conflicto('Una actividad completada no se puede borrar')
    db.delete(actividades).where(eq(actividades.id, id)).run()
  }
}
