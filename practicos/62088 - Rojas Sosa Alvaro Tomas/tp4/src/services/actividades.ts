import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { actividades, type Actividad } from '../db/schema.js'
import { Clientes } from './clientes.js'
import { recortar, hoyISO } from './normalizar.js'

export type DatosActividad = {
  descripcion: string
  fechaCompromiso?: string | null
}

/** Una actividad esta completada cuando tiene fecha de finalizacion. */
export function estaCompletada(a: Actividad): boolean {
  return a.fechaFinalizacion !== null
}

/** Pendiente y con fecha de compromiso anterior a hoy. */
export function estaVencida(a: Actividad, hoy = hoyISO()): boolean {
  return !estaCompletada(a) && a.fechaCompromiso !== null && a.fechaCompromiso < hoy
}

/**
 * Orden de los compromisos: primero los que no tienen fecha, despues los
 * vencidos y al final los de hoy en adelante. Dentro de cada grupo con
 * fecha, de la mas antigua a la mas reciente.
 */
function ordenarCompromisos(lista: Actividad[]): Actividad[] {
  const hoy = hoyISO()
  const grupo = (a: Actividad) => {
    if (a.fechaCompromiso === null) return 0
    return a.fechaCompromiso < hoy ? 1 : 2
  }

  return [...lista].sort((a, b) => {
    const ga = grupo(a)
    const gb = grupo(b)
    if (ga !== gb) return ga - gb
    if (ga === 0) return a.id - b.id
    return (a.fechaCompromiso ?? '').localeCompare(b.fechaCompromiso ?? '')
  })
}

/** Completadas: de la finalizacion mas reciente a la mas antigua. */
function ordenarCompletadas(lista: Actividad[]): Actividad[] {
  return [...lista].sort((a, b) => (b.fechaFinalizacion ?? '').localeCompare(a.fechaFinalizacion ?? ''))
}

export class Actividades {
  /** Todas las actividades de un cliente, ya ordenadas para mostrar. */
  static listarDeCliente(clienteId: number): Actividad[] {
    const todas = db.select().from(actividades).where(eq(actividades.clienteId, clienteId)).all()
    const pendientes = todas.filter((a) => !estaCompletada(a))
    const completadas = todas.filter(estaCompletada)
    return [...ordenarCompromisos(pendientes), ...ordenarCompletadas(completadas)]
  }

  static obtener(id: number): Actividad | undefined {
    return db.select().from(actividades).where(eq(actividades.id, id)).get()
  }

  static crear(clienteId: number, datos: DatosActividad): Actividad {
    if (!Clientes.obtener(clienteId)) throw new Error('El cliente no existe')

    const descripcion = recortar(datos.descripcion ?? '')
    if (descripcion === '') throw new Error('La descripcion es obligatoria')

    return db
      .insert(actividades)
      .values({
        clienteId,
        descripcion,
        fechaCompromiso: datos.fechaCompromiso ? String(datos.fechaCompromiso) : null,
        fechaFinalizacion: null,
      })
      .returning()
      .get()
  }

  static actualizar(id: number, datos: DatosActividad): Actividad | undefined {
    const actual = this.obtener(id)
    if (!actual) return undefined
    if (estaCompletada(actual)) throw new Error('Una actividad completada no se puede editar')

    const descripcion = recortar(datos.descripcion ?? '')
    if (descripcion === '') throw new Error('La descripcion es obligatoria')

    return db
      .update(actividades)
      .set({
        descripcion,
        fechaCompromiso: datos.fechaCompromiso ? String(datos.fechaCompromiso) : null,
      })
      .where(eq(actividades.id, id))
      .returning()
      .get()
  }

  /** Marca la actividad como completada poniendole la fecha de finalizacion. */
  static completar(id: number): Actividad | undefined {
    const actual = this.obtener(id)
    if (!actual) return undefined
    if (estaCompletada(actual)) return actual

    return db
      .update(actividades)
      .set({ fechaFinalizacion: hoyISO() })
      .where(eq(actividades.id, id))
      .returning()
      .get()
  }

  static eliminar(id: number): boolean {
    const actual = this.obtener(id)
    if (!actual) return false
    if (estaCompletada(actual)) throw new Error('Una actividad completada no se puede eliminar')

    db.delete(actividades).where(eq(actividades.id, id)).run()
    return true
  }
}
