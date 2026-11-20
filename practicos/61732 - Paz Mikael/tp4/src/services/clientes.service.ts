import { eq, or, like, desc, asc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { clientes, actividades, Cliente, Actividad } from '../db/schema.js'

export interface DetalleCliente extends Cliente {
  actividades: Actividad[]
}

export class Clientes {
  static async listar(busqueda?: string): Promise<Cliente[]> {
    if (busqueda && busqueda.trim()) {
      const termino = `%${busqueda.trim()}%`
      return db.select().from(clientes).where(
        or(
          like(clientes.nombre, termino),
          like(clientes.email, termino),
          like(clientes.telefono, termino),
          like(clientes.direccion, termino),
          like(clientes.ciudad, termino)
        )
      ).orderBy(asc(clientes.nombre)).all()
    }

    return db.select().from(clientes).orderBy(asc(clientes.nombre)).all()
  }

  static async obtenerPorId(id: number): Promise<DetalleCliente | null> {
    const lista = db.select().from(clientes).where(eq(clientes.id, id)).all()
    const cliente = lista[0]
    if (!cliente) return null

    const listaActividades = db.select().from(actividades)
      .where(eq(actividades.clienteId, id))
      .orderBy(desc(actividades.id))
      .all()

    return {
      ...cliente,
      actividades: listaActividades
    }
  }

  static async crear(datos: {
    nombre: string
    email: string
    telefono: string
    direccion: string
    ciudad: string
  }): Promise<Cliente> {
    if (!datos.nombre?.trim() || !datos.email?.trim()) {
      throw new Error('El nombre y el email son obligatorios')
    }

    const resultado = db.insert(clientes).values({
      nombre: datos.nombre.trim(),
      email: datos.email.trim(),
      telefono: (datos.telefono || '').trim(),
      direccion: (datos.direccion || '').trim(),
      ciudad: (datos.ciudad || '').trim(),
      creadoEn: new Date().toISOString()
    }).returning().all()

    return resultado[0]
  }

  static async actualizar(
    id: number,
    datos: Partial<{
      nombre: string
      email: string
      telefono: string
      direccion: string
      ciudad: string
    }>
  ): Promise<Cliente> {
    const existente = await this.obtenerPorId(id)
    if (!existente) {
      throw new Error(`Cliente con id ${id} no encontrado`)
    }

    const valores: Record<string, string> = {}
    if (datos.nombre !== undefined) valores.nombre = datos.nombre.trim()
    if (datos.email !== undefined) valores.email = datos.email.trim()
    if (datos.telefono !== undefined) valores.telefono = datos.telefono.trim()
    if (datos.direccion !== undefined) valores.direccion = datos.direccion.trim()
    if (datos.ciudad !== undefined) valores.ciudad = datos.ciudad.trim()

    const resultado = db.update(clientes)
      .set(valores)
      .where(eq(clientes.id, id))
      .returning()
      .all()

    return resultado[0]
  }

  static async eliminar(id: number): Promise<boolean> {
    const existente = await this.obtenerPorId(id)
    if (!existente) {
      throw new Error(`Cliente con id ${id} no encontrado`)
    }

    db.delete(actividades).where(eq(actividades.clienteId, id)).run()
    db.delete(clientes).where(eq(clientes.id, id)).run()
    return true
  }

  static async agregarActividad(
    clienteId: number,
    datos: { descripcion: string; fecha?: string | null }
  ): Promise<Actividad> {
    if (!datos.descripcion?.trim()) {
      throw new Error('La descripción de la actividad es obligatoria')
    }

    const cliente = await this.obtenerPorId(clienteId)
    if (!cliente) {
      throw new Error(`Cliente con id ${clienteId} no encontrado`)
    }

    const resultado = db.insert(actividades).values({
      clienteId,
      descripcion: datos.descripcion.trim(),
      fecha: datos.fecha ? datos.fecha.trim() : null,
      completada: false,
      fechaCompletada: null
    }).returning().all()

    return resultado[0]
  }

  static async actualizarActividad(
    actividadId: number,
    datos: { descripcion?: string; fecha?: string | null }
  ): Promise<Actividad> {
    const lista = db.select().from(actividades).where(eq(actividades.id, actividadId)).all()
    const actividad = lista[0]
    if (!actividad) {
      throw new Error(`Actividad con id ${actividadId} no encontrada`)
    }

    if (actividad.completada) {
      throw new Error('Las actividades completadas no se pueden editar ni borrar individualmente')
    }

    const valores: Record<string, any> = {}
    if (datos.descripcion !== undefined) valores.descripcion = datos.descripcion.trim()
    if (datos.fecha !== undefined) valores.fecha = datos.fecha ? datos.fecha.trim() : null

    const resultado = db.update(actividades)
      .set(valores)
      .where(eq(actividades.id, actividadId))
      .returning()
      .all()

    return resultado[0]
  }

  static async completarActividad(actividadId: number): Promise<Actividad> {
    const lista = db.select().from(actividades).where(eq(actividades.id, actividadId)).all()
    const actividad = lista[0]
    if (!actividad) {
      throw new Error(`Actividad con id ${actividadId} no encontrada`)
    }

    if (actividad.completada) {
      return actividad
    }

    const resultado = db.update(actividades)
      .set({
        completada: true,
        fechaCompletada: new Date().toISOString()
      })
      .where(eq(actividades.id, actividadId))
      .returning()
      .all()

    return resultado[0]
  }

  static async eliminarActividad(actividadId: number): Promise<boolean> {
    const lista = db.select().from(actividades).where(eq(actividades.id, actividadId)).all()
    const actividad = lista[0]
    if (!actividad) {
      throw new Error(`Actividad con id ${actividadId} no encontrada`)
    }

    if (actividad.completada) {
      throw new Error('Las actividades completadas no se pueden editar ni borrar individualmente')
    }

    db.delete(actividades).where(eq(actividades.id, actividadId)).run()
    return true
  }
}
