import { eq, or, like, sql, asc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { clientes, actividades, type Cliente } from '../db/schema.js'
import {
  normalizarNombre,
  normalizarEmail,
  normalizarTelefono,
  normalizarOpcional,
  normalizarBusqueda,
  sinAcentos,
  recortar,
} from './normalizar.js'

export type DatosCliente = {
  nombre: string
  apellido: string
  email: string
  telefono?: string | null
  domicilio?: string | null
  localidad?: string | null
}

/** Deja los datos listos para guardar y valida los campos obligatorios. */
function prepararDatos(datos: DatosCliente) {
  const nombre = normalizarNombre(datos.nombre ?? '')
  const apellido = normalizarNombre(datos.apellido ?? '')
  const email = normalizarEmail(datos.email ?? '')

  if (nombre === '') throw new Error('El nombre es obligatorio')
  if (apellido === '') throw new Error('El apellido es obligatorio')
  if (email === '') throw new Error('El email es obligatorio')

  return {
    nombre,
    apellido,
    email,
    telefono: normalizarOpcional(datos.telefono, normalizarTelefono),
    domicilio: normalizarOpcional(datos.domicilio, recortar),
    localidad: normalizarOpcional(datos.localidad, normalizarNombre),
  }
}

export class Clientes {
  /** Lista los clientes; con `busqueda` filtra por coincidencia en cualquier campo. */
  static listar(busqueda = ''): Cliente[] {
    const orden = [asc(clientes.apellido), asc(clientes.nombre)] as const
    const texto = normalizarBusqueda(busqueda)

    if (texto === '') {
      return db.select().from(clientes).orderBy(...orden).all()
    }

    // sin_acentos() se registra en db/index.ts: compara ignorando tildes y mayusculas.
    const patron = `%${sinAcentos(texto)}%`
    return db
      .select()
      .from(clientes)
      .where(
        or(
          like(sql`sin_acentos(${clientes.nombre})`, patron),
          like(sql`sin_acentos(${clientes.apellido})`, patron),
          like(sql`sin_acentos(${clientes.nombre} || ' ' || ${clientes.apellido})`, patron),
          like(sql`sin_acentos(${clientes.email})`, patron),
          like(sql`sin_acentos(coalesce(${clientes.telefono}, ''))`, patron),
          like(sql`sin_acentos(coalesce(${clientes.domicilio}, ''))`, patron),
          like(sql`sin_acentos(coalesce(${clientes.localidad}, ''))`, patron),
          like(sql`cast(${clientes.id} as text)`, patron),
        ),
      )
      .orderBy(...orden)
      .all()
  }

  static obtener(id: number): Cliente | undefined {
    return db.select().from(clientes).where(eq(clientes.id, id)).get()
  }

  static porEmail(email: string): Cliente | undefined {
    return db.select().from(clientes).where(eq(clientes.email, normalizarEmail(email))).get()
  }

  static crear(datos: DatosCliente): Cliente {
    const valores = prepararDatos(datos)

    if (this.porEmail(valores.email)) {
      throw new Error('Ya existe un cliente con ese email')
    }

    return db.insert(clientes).values(valores).returning().get()
  }

  static actualizar(id: number, datos: DatosCliente): Cliente | undefined {
    if (!this.obtener(id)) return undefined

    const valores = prepararDatos(datos)
    const repetido = this.porEmail(valores.email)
    if (repetido && repetido.id !== id) {
      throw new Error('Ya existe un cliente con ese email')
    }

    return db.update(clientes).set(valores).where(eq(clientes.id, id)).returning().get()
  }

  /** Elimina el cliente y, por composicion, todas sus actividades. */
  static eliminar(id: number): boolean {
    if (!this.obtener(id)) return false
    db.delete(actividades).where(eq(actividades.clienteId, id)).run()
    db.delete(clientes).where(eq(clientes.id, id)).run()
    return true
  }
}
