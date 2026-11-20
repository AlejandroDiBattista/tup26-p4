import { db, initDb } from './connection.js';
import { clientes, actividades } from './schema.js';
import { count } from 'drizzle-orm';

export async function seed() {
  await initDb();

  const [clienteCount] = await db.select({ total: count() }).from(clientes);

  if (clienteCount && clienteCount.total > 0) {
    console.log(`ℹ️ La base de datos ya contiene ${clienteCount.total} clientes. Omitiendo seed.`);
    return;
  }

  console.log('🌱 Sembrando base de datos con 10 clientes y actividades...');

  const hoy = new Date();
  const formatFecha = (d: Date) => d.toISOString().split('T')[0];

  const fechaAyer = new Date(hoy);
  fechaAyer.setDate(fechaAyer.getDate() - 3);

  const fechaSemanaPasada = new Date(hoy);
  fechaSemanaPasada.setDate(fechaSemanaPasada.getDate() - 7);

  const fechaManana = new Date(hoy);
  fechaManana.setDate(fechaManana.getDate() + 2);

  const fechaSemanaProxima = new Date(hoy);
  fechaSemanaProxima.setDate(fechaSemanaProxima.getDate() + 8);

  const datosSemilla = [
    {
      cliente: {
        nombre: 'Sofía',
        apellido: 'Martínez',
        email: 'sofia.martinez@ejemplo.com',
        domicilio: 'Av. Sarmiento 1240',
        localidad: 'San Miguel de Tucumán',
        telefono: '381-4567890',
      },
      actividades: [
        { descripcion: 'Llamar para coordinar reunión de bienvenida', fechaCompromiso: formatFecha(fechaAyer), fechaFinalizacion: null }, // Vencida
        { descripcion: 'Enviar propuesta de presupuesto inicial', fechaCompromiso: formatFecha(fechaManana), fechaFinalizacion: null }, // Futura
        { descripcion: 'Relevamiento de requerimientos técnicos', fechaCompromiso: formatFecha(fechaSemanaPasada), fechaFinalizacion: formatFecha(fechaSemanaPasada) }, // Completada
      ],
    },
    {
      cliente: {
        nombre: 'Mateo',
        apellido: 'González',
        email: 'mateo.gonzalez@empresa.com',
        domicilio: 'San Martín 450 Piso 3',
        localidad: 'Yerba Buena',
        telefono: '381-5123456',
      },
      actividades: [
        { descripcion: 'Revisar contrato de servicios', fechaCompromiso: null, fechaFinalizacion: null }, // Sin fecha
        { descripcion: 'Demostración de la plataforma', fechaCompromiso: formatFecha(fechaSemanaProxima), fechaFinalizacion: null }, // Futura
        { descripcion: 'Contacto por LinkedIn y presentación', fechaCompromiso: formatFecha(fechaSemanaPasada), fechaFinalizacion: formatFecha(fechaSemanaPasada) }, // Completada
      ],
    },
    {
      cliente: {
        nombre: 'Lucía',
        apellido: 'Fernández',
        email: 'lucia.fernandez@tech.io',
        domicilio: 'Crisóstomo Álvarez 780',
        localidad: 'San Miguel de Tucumán',
        telefono: '381-6789012',
      },
      actividades: [
        { descripcion: 'Actualizar lista de precios corporativos', fechaCompromiso: formatFecha(fechaAyer), fechaFinalizacion: null }, // Vencida
        { descripcion: 'Reunión de seguimiento mensual', fechaCompromiso: null, fechaFinalizacion: null }, // Sin fecha
      ],
    },
    {
      cliente: {
        nombre: 'Joaquín',
        apellido: 'Romero',
        email: 'jromero@soluciones.com.ar',
        domicilio: 'Av. Aconquija 2100',
        localidad: 'Yerba Buena',
        telefono: '381-4321987',
      },
      actividades: [
        { descripcion: 'Configuración inicial del entorno cliente', fechaCompromiso: formatFecha(fechaSemanaPasada), fechaFinalizacion: formatFecha(fechaSemanaPasada) }, // Completada
        { descripcion: 'Capacitación al equipo de ventas', fechaCompromiso: formatFecha(fechaManana), fechaFinalizacion: null }, // Futura
      ],
    },
    {
      cliente: {
        nombre: 'Camila',
        apellido: 'Álvarez',
        email: 'camila.alvarez@logistica.com',
        domicilio: '24 de Septiembre 320',
        localidad: 'San Miguel de Tucumán',
        telefono: '381-5678123',
      },
      actividades: [
        { descripcion: 'Enviar factura electrónica AFIP', fechaCompromiso: null, fechaFinalizacion: null }, // Sin fecha
        { descripcion: 'Coordinar entrega de hardware', fechaCompromiso: formatFecha(fechaSemanaProxima), fechaFinalizacion: null }, // Futura
        { descripcion: 'Firma de acuerdo de confidencialidad NDA', fechaCompromiso: formatFecha(fechaSemanaPasada), fechaFinalizacion: formatFecha(fechaSemanaPasada) }, // Completada
      ],
    },
    {
      cliente: {
        nombre: 'Bautista',
        apellido: 'López',
        email: 'bautista.lopez@gmail.com',
        domicilio: 'Laprida 610',
        localidad: 'Tafí Viejo',
        telefono: '381-4987654',
      },
      actividades: [
        { descripcion: 'Llamar para verificar recepción de mercadería', fechaCompromiso: formatFecha(fechaAyer), fechaFinalizacion: null }, // Vencida
      ],
    },
    {
      cliente: {
        nombre: 'Valentina',
        apellido: 'Díaz',
        email: 'valen.diaz@consultoria.org',
        domicilio: 'Muñecas 150',
        localidad: 'San Miguel de Tucumán',
        telefono: '381-5432109',
      },
      actividades: [
        { descripcion: 'Auditoría inicial de procesos', fechaCompromiso: formatFecha(fechaSemanaPasada), fechaFinalizacion: formatFecha(fechaSemanaPasada) }, // Completada
        { descripcion: 'Presentación de informe diagnóstico', fechaCompromiso: formatFecha(fechaManana), fechaFinalizacion: null }, // Futura
        { descripcion: 'Definir cronograma de capacitaciones', fechaCompromiso: null, fechaFinalizacion: null }, // Sin fecha
      ],
    },
    {
      cliente: {
        nombre: 'Ignacio',
        apellido: 'Benítez',
        email: 'ibenitez@distribuidora.com',
        domicilio: 'Av. Soldati 380',
        localidad: 'San Miguel de Tucumán',
        telefono: '381-6123987',
      },
      actividades: [
        { descripcion: 'Renovación de licencia anual', fechaCompromiso: formatFecha(fechaSemanaProxima), fechaFinalizacion: null }, // Futura
      ],
    },
    {
      cliente: {
        nombre: 'Martina',
        apellido: 'Castro',
        email: 'martina.castro@estudiojuridico.com',
        domicilio: 'Congreso 420',
        localidad: 'San Miguel de Tucumán',
        telefono: '381-4234567',
      },
      actividades: [
        { descripcion: 'Revisión de cláusulas legales', fechaCompromiso: formatFecha(fechaSemanaPasada), fechaFinalizacion: formatFecha(fechaSemanaPasada) }, // Completada
        { descripcion: 'Enviar borrador de poder judicial', fechaCompromiso: null, fechaFinalizacion: null }, // Sin fecha
      ],
    },
    {
      cliente: {
        nombre: 'Tomás',
        apellido: 'Pérez',
        email: 'tomas.perez@innovar.com',
        domicilio: 'Av. Perón 1800',
        localidad: 'Yerba Buena',
        telefono: '381-5987123',
      },
      actividades: [
        { descripcion: 'Llamada exploratoria sobre nuevo módulo', fechaCompromiso: formatFecha(fechaAyer), fechaFinalizacion: null }, // Vencida
        { descripcion: 'Enviar cotización personalizada', fechaCompromiso: formatFecha(fechaManana), fechaFinalizacion: null }, // Futura
      ],
    },
  ];

  for (const item of datosSemilla) {
    const [clienteInsertado] = await db.insert(clientes).values(item.cliente).returning();
    if (clienteInsertado && item.actividades.length > 0) {
      await db.insert(actividades).values(
        item.actividades.map((act) => ({
          clienteId: clienteInsertado.id,
          descripcion: act.descripcion,
          fechaCompromiso: act.fechaCompromiso,
          fechaFinalizacion: act.fechaFinalizacion,
        }))
      );
    }
  }

  console.log('✅ Seed completado con éxito: 10 clientes y sus actividades.');
}

// Si se ejecuta directamente por CLI
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error durante el seed:', err);
      process.exit(1);
    });
}
