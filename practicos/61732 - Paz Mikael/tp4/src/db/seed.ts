import { db } from './index.js'
import { clientes, actividades } from './schema.js'

export async function sembrarDatos() {
  const existentes = db.select().from(clientes).all()
  if (existentes.length > 0) return

  const nuevos = [
    {
      nombre: 'Ana García',
      email: 'ana.garcia@example.com',
      telefono: '381 555 0123',
      direccion: 'San Martín 450',
      ciudad: 'Yerba Buena',
      creadoEn: new Date('2026-09-01').toISOString(),
      compromisos: [
        { descripcion: 'Consultar nuevas necesidades', fecha: null },
        { descripcion: 'Enviar presupuesto', fecha: '2026-10-16' },
        { descripcion: 'Llamar para seguimiento', fecha: '2026-10-22' }
      ],
      completadas: [
        { descripcion: 'Enviar presentación', fecha: '2026-10-10', fechaCompletada: '2026-10-15' },
        { descripcion: 'Primera reunión', fecha: '2026-10-08', fechaCompletada: '2026-10-12' }
      ]
    },
    {
      nombre: 'Bruno López',
      email: 'bruno.lopez@example.com',
      telefono: '381 444 1122',
      direccion: 'Av. Aconquija 1200',
      ciudad: 'Yerba Buena',
      creadoEn: new Date('2026-09-05').toISOString(),
      compromisos: [
        { descripcion: 'Coordinar visita presencial', fecha: '2026-10-28' }
      ],
      completadas: [
        { descripcion: 'Contacto inicial por WhatsApp', fecha: '2026-09-10', fechaCompletada: '2026-09-10' }
      ]
    },
    {
      nombre: 'Carla Pérez',
      email: 'carla.perez@example.com',
      telefono: '381 666 3344',
      direccion: '25 de Mayo 320',
      ciudad: 'San Miguel de Tucumán',
      creadoEn: new Date('2026-09-10').toISOString(),
      compromisos: [
        { descripcion: 'Enviar catálogo actualizado', fecha: '2026-10-30' }
      ],
      completadas: []
    },
    {
      nombre: 'Diego Ruiz',
      email: 'diego.ruiz@example.com',
      telefono: '381 777 5566',
      direccion: 'Laprida 850',
      ciudad: 'San Miguel de Tucumán',
      creadoEn: new Date('2026-09-12').toISOString(),
      compromisos: [],
      completadas: [
        { descripcion: 'Reunión de balance trimestral', fecha: '2026-10-05', fechaCompletada: '2026-10-06' }
      ]
    },
    {
      nombre: 'Elena Torres',
      email: 'elena.torres@example.com',
      telefono: '381 888 7788',
      direccion: 'Congreso 120',
      ciudad: 'San Miguel de Tucumán',
      creadoEn: new Date('2026-09-15').toISOString(),
      compromisos: [
        { descripcion: 'Revisión técnica de requerimientos', fecha: '2026-11-02' }
      ],
      completadas: []
    },
    {
      nombre: 'Federico Díaz',
      email: 'federico.diaz@example.com',
      telefono: '381 999 9900',
      direccion: 'Crisóstomo Álvarez 640',
      ciudad: 'San Miguel de Tucumán',
      creadoEn: new Date('2026-09-18').toISOString(),
      compromisos: [],
      completadas: []
    },
    {
      nombre: 'Gabriela Sosa',
      email: 'gabriela.sosa@example.com',
      telefono: '381 333 2211',
      direccion: 'Sarmiento 410',
      ciudad: 'Yerba Buena',
      creadoEn: new Date('2026-09-20').toISOString(),
      compromisos: [
        { descripcion: 'Demostración del sistema', fecha: '2026-10-25' }
      ],
      completadas: [
        { descripcion: 'Confirmación de presupuesto preliminar', fecha: '2026-09-25', fechaCompletada: '2026-09-26' }
      ]
    }
  ]

  for (const item of nuevos) {
    const insertados = db.insert(clientes).values({
      nombre: item.nombre,
      email: item.email,
      telefono: item.telefono,
      direccion: item.direccion,
      ciudad: item.ciudad,
      creadoEn: item.creadoEn
    }).returning().all()

    const clienteId = insertados[0].id

    for (const comp of item.compromisos) {
      db.insert(actividades).values({
        clienteId,
        descripcion: comp.descripcion,
        fecha: comp.fecha,
        completada: false,
        fechaCompletada: null
      }).run()
    }

    for (const act of item.completadas) {
      db.insert(actividades).values({
        clienteId,
        descripcion: act.descripcion,
        fecha: act.fecha,
        completada: true,
        fechaCompletada: act.fechaCompletada
      }).run()
    }
  }
}
