import { db } from './index.js'
import { clientes, actividades } from './schema.js'
import { Clientes } from '../services/clientes.js'
import { Actividades } from '../services/actividades.js'
import { hoyISO } from '../services/normalizar.js'

/** Devuelve una fecha ISO corrida `dias` respecto de hoy. */
function enDias(dias: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

type Semilla = {
  cliente: Parameters<typeof Clientes.crear>[0]
  // Compromisos pendientes: null = sin fecha, negativo = vencido, positivo = futuro
  pendientes: Array<{ descripcion: string; dias: number | null }>
  completadas: Array<{ descripcion: string; hace: number }>
}

const datos: Semilla[] = [
  {
    cliente: { nombre: 'Ana', apellido: 'García', email: 'ana.garcia@example.com', telefono: '+54 381 555 0123', domicilio: 'San Martín 450', localidad: 'Yerba Buena' },
    pendientes: [
      { descripcion: 'Consultar nuevas necesidades', dias: null },
      { descripcion: 'Enviar presupuesto', dias: -8 },
      { descripcion: 'Llamar para seguimiento', dias: 5 },
    ],
    completadas: [
      { descripcion: 'Enviar presentación', hace: 9 },
      { descripcion: 'Primera reunión', hace: 12 },
    ],
  },
  {
    cliente: { nombre: 'Bruno', apellido: 'López', email: 'bruno.lopez@example.com', telefono: '+54 381 555 0144', domicilio: 'Córdoba 1200', localidad: 'San Miguel de Tucumán' },
    pendientes: [
      { descripcion: 'Revisar contrato', dias: 10 },
      { descripcion: 'Pedir documentación', dias: null },
    ],
    completadas: [{ descripcion: 'Llamado inicial', hace: 16 }],
  },
  {
    cliente: { nombre: 'Carla', apellido: 'Pérez', email: 'carla.perez@example.com', telefono: '+54 381 555 0187', domicilio: 'Laprida 88', localidad: 'Tafí Viejo' },
    pendientes: [
      { descripcion: 'Coordinar visita técnica', dias: 6 },
      { descripcion: 'Enviar catálogo actualizado', dias: null },
      { descripcion: 'Responder consulta de garantía', dias: -3 },
    ],
    completadas: [],
  },
  {
    cliente: { nombre: 'Diego', apellido: 'Ruiz', email: 'diego.ruiz@example.com', telefono: '+54 381 555 0190', domicilio: 'Av. Aconquija 2300', localidad: 'Yerba Buena' },
    pendientes: [{ descripcion: 'Presentar propuesta anual', dias: -1 }],
    completadas: [{ descripcion: 'Relevamiento inicial', hace: 20 }],
  },
  {
    cliente: { nombre: 'Elena', apellido: 'Torres', email: 'elena.torres@example.com', telefono: '+54 381 555 0211', domicilio: 'Muñecas 741', localidad: 'San Miguel de Tucumán' },
    pendientes: [],
    completadas: [
      { descripcion: 'Firma de acuerdo', hace: 26 },
      { descripcion: 'Capacitación del equipo', hace: 4 },
    ],
  },
  {
    cliente: { nombre: 'Federico', apellido: 'Díaz', email: 'federico.diaz@example.com', telefono: '+54 381 555 0233', domicilio: 'Mendoza 510', localidad: 'San Miguel de Tucumán' },
    pendientes: [
      { descripcion: 'Agendar demo del sistema', dias: 17 },
      { descripcion: 'Confirmar datos de facturación', dias: null },
    ],
    completadas: [],
  },
  {
    cliente: { nombre: 'Gabriela', apellido: 'Sosa', email: 'gabriela.sosa@example.com', telefono: '+54 381 555 0255', domicilio: 'Santiago 1430', localidad: 'Banda del Río Salí' },
    pendientes: [
      { descripcion: 'Confirmar fecha de entrega', dias: 3 },
      { descripcion: 'Enviar factura', dias: -5 },
    ],
    completadas: [{ descripcion: 'Relevamiento de requisitos', hace: 19 }],
  },
  {
    cliente: { nombre: 'Hernán', apellido: 'Vega', email: 'hernan.vega@example.com', telefono: '+54 381 555 0278', domicilio: 'Chacabuco 95', localidad: 'Lules' },
    pendientes: [{ descripcion: 'Renovar suscripción', dias: 38 }],
    completadas: [],
  },
  {
    cliente: { nombre: 'Irene', apellido: 'Moreno', email: 'irene.moreno@example.com', telefono: '+54 381 555 0294', domicilio: 'Junín 620', localidad: 'Tafí Viejo' },
    pendientes: [
      { descripcion: 'Enviar comparativa de planes', dias: null },
      { descripcion: 'Reunión de cierre', dias: 1 },
    ],
    completadas: [{ descripcion: 'Visita a la planta', hace: 7 }],
  },
  {
    cliente: { nombre: 'Joaquín', apellido: 'Benítez', email: 'joaquin.benitez@example.com', telefono: '+54 381 555 0310', domicilio: 'Bolívar 1105', localidad: 'San Miguel de Tucumán' },
    pendientes: [
      { descripcion: 'Actualizar datos de contacto', dias: -14 },
      { descripcion: 'Enviar informe trimestral', dias: 9 },
    ],
    completadas: [{ descripcion: 'Alta en el sistema', hace: 30 }],
  },
]

// Reinicia la carga para que repetirla no duplique datos.
db.delete(actividades).run()
db.delete(clientes).run()

for (const fila of datos) {
  const cliente = Clientes.crear(fila.cliente)

  for (const act of fila.pendientes) {
    Actividades.crear(cliente.id, {
      descripcion: act.descripcion,
      fechaCompromiso: act.dias === null ? null : enDias(act.dias),
    })
  }

  for (const act of fila.completadas) {
    const creada = Actividades.crear(cliente.id, {
      descripcion: act.descripcion,
      fechaCompromiso: enDias(-act.hace - 2),
    })
    Actividades.completar(creada.id)
  }
}

const totalClientes = db.select().from(clientes).all().length
const todas = db.select().from(actividades).all()
const completadas = todas.filter((a) => a.fechaFinalizacion !== null).length
const hoy = hoyISO()
const vencidas = todas.filter((a) => a.fechaFinalizacion === null && a.fechaCompromiso !== null && a.fechaCompromiso < hoy).length
const sinFecha = todas.filter((a) => a.fechaFinalizacion === null && a.fechaCompromiso === null).length

console.log(`Base cargada: ${totalClientes} clientes, ${todas.length} actividades`)
console.log(`  completadas: ${completadas} · vencidas: ${vencidas} · sin fecha: ${sinFecha} · futuras: ${todas.length - completadas - vencidas - sinFecha}`)
