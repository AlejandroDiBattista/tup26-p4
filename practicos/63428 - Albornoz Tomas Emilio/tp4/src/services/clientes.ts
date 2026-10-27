import { and, asc, eq, or, sql } from 'drizzle-orm'
import type { SQLWrapper } from 'drizzle-orm'
import { db } from '../db/conexion'
import { clientes } from '../db/schema'
import { ErrorServicio } from './errores'

export interface DatosCliente {
  nombre?: unknown
  email?: unknown
  telefono?: unknown
  direccion?: unknown
}

const limpiar = (valor: unknown) => (typeof valor === 'string' ? valor.trim() : '')

const contiene = (columna: SQLWrapper, palabra: string) => {
  const escapada = palabra.replace(/[\\%_]/g, '\\$&')
  return sql`${columna} LIKE ${'%' + escapada + '%'} ESCAPE '\\'`
}

const validar = (datos: DatosCliente) => {
  const nombre = limpiar(datos.nombre)
  const email = limpiar(datos.email)
  const telefono = limpiar(datos.telefono)
  const direccion = limpiar(datos.direccion)

  if (!nombre) {
    throw new ErrorServicio(400, 'El nombre es obligatorio')
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ErrorServicio(400, 'El email no es válido')
  }

  return { nombre, email, telefono, direccion }
}

export class Clientes {
  static listar(busqueda?: string) {
    const palabras = (busqueda ?? '').trim().split(/\s+/).filter(Boolean)

    const condiciones = palabras.map((palabra) =>
      or(
        contiene(clientes.nombre, palabra),
        contiene(clientes.email, palabra),
        contiene(clientes.telefono, palabra),
        contiene(clientes.direccion, palabra),
        contiene(sql`CAST(${clientes.id} AS TEXT)`, palabra)
      )
    )

    return db
      .select()
      .from(clientes)
      .where(and(...condiciones))
      .orderBy(asc(clientes.nombre), asc(clientes.id))
      .all()
  }

  static obtener(id: number) {
    const cliente = db.select().from(clientes).where(eq(clientes.id, id)).get()
    if (!cliente) {
      throw new ErrorServicio(404, 'Cliente no encontrado')
    }
    return cliente
  }

  static crear(datos: DatosCliente) {
    const valores = validar(datos)
    return db.insert(clientes).values(valores).returning().get()
  }

  static actualizar(id: number, datos: DatosCliente) {
    Clientes.obtener(id)
    const valores = validar(datos)
    return db.update(clientes).set(valores).where(eq(clientes.id, id)).returning().get()
  }

  static eliminar(id: number) {
    Clientes.obtener(id)
    db.delete(clientes).where(eq(clientes.id, id)).run()
  }
}
