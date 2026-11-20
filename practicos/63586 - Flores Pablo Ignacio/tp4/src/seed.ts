import { count } from 'drizzle-orm'
import { pathToFileURL } from 'node:url'
import { db } from './db/conexion.js'
import { actividades, clientes } from './db/esquema.js'

const hoy = new Date()
const dia = (delta: number) => {
  const f = new Date(hoy)
  f.setDate(f.getDate() + delta)
  return f.toISOString().slice(0, 10)
}

const datos = [
  ['Lucía', 'Fernández', 'lucia.fernandez@example.com', 'Av. Mate de Luna 1234', 'San Miguel de Tucumán', '3815550101'],
  ['Martín', 'Gómez', 'martin.gomez@example.com', 'Calle Muñecas 450', 'Yerba Buena', '3815550102'],
  ['Carolina', 'Rojas', 'carolina.rojas@example.com', 'Bv. 9 de Julio 88', 'Tafí Viejo', '3815550103'],
  ['Diego', 'Herrera', 'diego.herrera@example.com', 'San Martín 920', 'Concepción', '3815550104'],
  ['Valeria', 'Acosta', 'valeria.acosta@example.com', 'Lavalle 311', 'San Miguel de Tucumán', '3815550105'],
  ['Joaquín', 'Paz', 'joaquin.paz@example.com', 'Mendoza 1500', 'Banda del Río Salí', '3815550106'],
  ['Florencia', 'Ledesma', 'florencia.ledesma@example.com', null, 'Yerba Buena', '3815550107'],
  ['Sebastián', 'Villagra', 'sebastian.villagra@example.com', 'Corrientes 77', 'Famaillá', null],
  ['Agustina', 'Medina', 'agustina.medina@example.com', 'Rivadavia 640', 'Monteros', '3815550109'],
  ['Nicolás', 'Sosa', 'nicolas.sosa@example.com', 'Alberdi 205', 'San Miguel de Tucumán', '3815550110'],
] as const

// [índice de cliente, descripción, compromiso, finalización]
const tareas: [number, string, string | null, string | null][] = [
  [0, 'Enviar presupuesto del plan anual', dia(3), null],
  [0, 'Llamada de bienvenida', dia(-20), dia(-19)],
  [0, 'Revisar contrato', null, null],
  [1, 'Coordinar reunión de seguimiento', dia(-2), null],
  [1, 'Enviar catálogo actualizado', dia(-30), dia(-28)],
  [2, 'Demostración del producto', dia(7), null],
  [3, 'Resolver reclamo de facturación', dia(-5), null],
  [3, 'Confirmar recepción de la factura', dia(-12), dia(-10)],
  [4, 'Enviar propuesta comercial', dia(1), null],
  [5, 'Pedir referencias de otros clientes', null, null],
  [6, 'Actualizar datos de contacto', null, dia(-3)],
  [7, 'Visita en sucursal', dia(14), null],
  [8, 'Renovar suscripción', dia(10), null],
  [8, 'Encuesta de satisfacción', dia(-40), dia(-38)],
  [9, 'Llamar para ofrecer capacitación', dia(-1), null],
]

export async function sembrar() {
  const [{ total }] = await db.select({ total: count() }).from(clientes)
  if (total > 0) {
    console.log(`La base ya tiene ${total} clientes: no se vuelve a sembrar.`)
  } else {
    const creados = await db
      .insert(clientes)
      .values(datos.map(([nombre, apellido, email, domicilio, localidad, telefono]) => ({ nombre, apellido, email, domicilio, localidad, telefono })))
      .returning({ id: clientes.id })
    await db.insert(actividades).values(
      tareas.map(([i, descripcion, fechaCompromiso, fechaFinalizacion]) => ({
        clienteId: creados[i].id,
        descripcion,
        fechaCompromiso,
        fechaFinalizacion,
      })),
    )
    console.log(`Sembrados ${creados.length} clientes y ${tareas.length} actividades.`)
  }
}

// Al ejecutarse directamente (npm run seed) siembra la base.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await sembrar()
