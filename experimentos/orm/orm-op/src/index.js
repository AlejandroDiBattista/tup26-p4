import { db } from './db.js'
import { clientes, actividades } from './schema.js'

// Insertar un nuevo cliente
const [cliente] = await db.insert(clientes)
  .values({ nombre: 'Juan', apellido: 'Pérez', email: 'juan@test.com', telefono: '555-1234' })
  .returning()

console.log('Cliente creado:', cliente)

// Actividades para el cliente
const [actividad1] = await db.insert(actividades)
  .values({ clienteId: cliente.id, titulo: 'Llamar al cliente', fechaCompromiso: '2026-12-01', completada: false })
  .returning()

console.log('Actividad creada:', actividad1)

// Actividad sin fecha de compromiso (pendiente sin fecha)
const [actividad2] = await db.insert(actividades)
  .values({ clienteId: cliente.id, titulo: 'Enviar correo de seguimiento', completada: false })
  .returning()

console.log('Actividad sin fecha:', actividad2)

// Seleccionar todas las actividades del cliente
const todasLasActividades = await db.select().from(actividades).where(clienteId => clienteId === cliente.id)
console.log('Todas las actividades de', cliente.nombre, ':', todasLasActividades)

// Seleccionar todos los clientes
console.log('Clientes registrados:', await db.select().from(clientes))