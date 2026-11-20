import { eq } from 'drizzle-orm'
import { db } from '../db/conexion'
import { actividades } from '../db/schema'
import type { Actividad } from '../db/schema'
import { Clientes } from './clientes'
import { ErrorServicio } from './errores'

export interface DatosActividad {
  descripcion?: unknown
  fecha?: unknown
}

const hoy = () => {
  const ahora = new Date()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${ahora.getFullYear()}-${mes}-${dia}`
}

const fechaValida = (fecha: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return false
  }
  const [anio, mes, dia] = fecha.split('-').map(Number)
  const date = new Date(anio, mes - 1, dia)
  return date.getFullYear() === anio && date.getMonth() === mes - 1 && date.getDate() === dia
}

const validar = (datos: DatosActividad) => {
  const descripcion = typeof datos.descripcion === 'string' ? datos.descripcion.trim() : ''
  const fecha = typeof datos.fecha === 'string' ? datos.fecha.trim() : ''

  if (!descripcion) {
    throw new ErrorServicio(400, 'La descripción es obligatoria')
  }
  if (fecha && !fechaValida(fecha)) {
    throw new ErrorServicio(400, 'La fecha no es válida')
  }

  return { descripcion, fecha: fecha || null }
}

const ordenarPendientes = (a: Actividad, b: Actividad) => {
  if (a.fecha && b.fecha) {
    return a.fecha.localeCompare(b.fecha) || a.id - b.id
  }
  if (a.fecha) return -1
  if (b.fecha) return 1
  return a.id - b.id
}

const ordenarCompletadas = (a: Actividad, b: Actividad) => {
  return (b.fechaCompletada ?? '').localeCompare(a.fechaCompletada ?? '') || b.id - a.id
}

export class Actividades {
  static listarPorCliente(clienteId: number) {
    Clientes.obtener(clienteId)
    const todas = db.select().from(actividades).where(eq(actividades.clienteId, clienteId)).all()
    const pendientes = todas.filter((actividad) => !actividad.completada).sort(ordenarPendientes)
    const completadas = todas.filter((actividad) => actividad.completada).sort(ordenarCompletadas)
    return [...pendientes, ...completadas]
  }

  static obtener(id: number) {
    const actividad = db.select().from(actividades).where(eq(actividades.id, id)).get()
    if (!actividad) {
      throw new ErrorServicio(404, 'Actividad no encontrada')
    }
    return actividad
  }

  static crear(clienteId: number, datos: DatosActividad) {
    Clientes.obtener(clienteId)
    const valores = validar(datos)
    return db
      .insert(actividades)
      .values({ clienteId, ...valores })
      .returning()
      .get()
  }

  static actualizar(id: number, datos: DatosActividad) {
    const actividad = Actividades.obtener(id)
    if (actividad.completada) {
      throw new ErrorServicio(409, 'Una actividad completada no se puede editar')
    }
    const valores = validar(datos)
    return db.update(actividades).set(valores).where(eq(actividades.id, id)).returning().get()
  }

  static completar(id: number) {
    const actividad = Actividades.obtener(id)
    if (actividad.completada) {
      throw new ErrorServicio(409, 'La actividad ya está completada')
    }
    return db
      .update(actividades)
      .set({ completada: true, fechaCompletada: hoy() })
      .where(eq(actividades.id, id))
      .returning()
      .get()
  }

  static eliminar(id: number) {
    const actividad = Actividades.obtener(id)
    if (actividad.completada) {
      throw new ErrorServicio(409, 'Una actividad completada no se puede borrar')
    }
    db.delete(actividades).where(eq(actividades.id, id)).run()
  }
}
