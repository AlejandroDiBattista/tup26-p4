import { db, clientes, actividades } from './db.js';

interface ClienteSeed {
  nombre: string;
  apellido: string;
  email: string;
  domicilio?: string;
  localidad?: string;
  telefono?: string;
  actividades: {
    descripcion: string;
    fechaCompromiso?: string | null;
    fechaFinalizacion?: string | null;
  }[];
}

const clientesIniciales: ClienteSeed[] = [
  {
    nombre: 'Ana',
    apellido: 'García',
    email: 'ana.garcia@example.com',
    domicilio: 'Av. Corrientes 1234',
    localidad: 'Buenos Aires',
    telefono: '+54 11 4567-8901',
    actividades: [
      { descripcion: 'Contactar al cliente para presentación de propuesta', fechaCompromiso: null, fechaFinalizacion: null },
      { descripcion: 'Reunión de seguimiento inicial', fechaCompromiso: '2026-10-20', fechaFinalizacion: '2026-10-18' },
      { descripcion: 'Enviar cotización ajustada', fechaCompromiso: '2026-10-24', fechaFinalizacion: null },
      { descripcion: 'Llamada telefónica para confirmar recepción', fechaCompromiso: '2026-11-05', fechaFinalizacion: null },
    ],
  },
  {
    nombre: 'Bruno',
    apellido: 'López',
    email: 'bruno.lopez@example.com',
    domicilio: 'San Martín 450',
    localidad: 'Rosario',
    telefono: '+54 341 555-1234',
    actividades: [
      { descripcion: 'Firma de contrato de prestación', fechaCompromiso: '2026-10-15', fechaFinalizacion: '2026-10-14' },
      { descripcion: 'Capacitación al equipo de operaciones', fechaCompromiso: '2026-11-02', fechaFinalizacion: null },
    ],
  },
  {
    nombre: 'Carla',
    apellido: 'Pérez',
    email: 'carla.perez@example.com',
    domicilio: 'Belgrano 789',
    localidad: 'Córdoba',
    telefono: '+54 351 444-9876',
    actividades: [
      { descripcion: 'Relevar requerimientos del nuevo sistema', fechaCompromiso: null, fechaFinalizacion: null },
      { descripcion: 'Entrega de demo funcional', fechaCompromiso: '2026-10-22', fechaFinalizacion: null },
    ],
  },
  {
    nombre: 'Diego',
    apellido: 'Ruiz',
    email: 'diego.ruiz@example.com',
    domicilio: 'Mitre 120',
    localidad: 'Mendoza',
    telefono: '+54 261 420-3311',
    actividades: [
      { descripcion: 'Envío de balance mensual', fechaCompromiso: '2026-10-10', fechaFinalizacion: '2026-10-09' },
      { descripcion: 'Revisión presupuestaria Q4', fechaCompromiso: '2026-10-23', fechaFinalizacion: null },
    ],
  },
  {
    nombre: 'Elena',
    apellido: 'Torres',
    email: 'elena.torres@example.com',
    domicilio: 'Las Heras 654',
    localidad: 'San Miguel de Tucumán',
    telefono: '+54 381 499-8877',
    actividades: [
      { descripcion: 'Consulta sobre planes corporativos', fechaCompromiso: null, fechaFinalizacion: null },
      { descripcion: 'Demostración de CRM en vivo', fechaCompromiso: '2026-10-30', fechaFinalizacion: null },
      { descripcion: 'Envío de lista de precios 2026', fechaCompromiso: '2026-10-12', fechaFinalizacion: '2026-10-11' },
    ],
  },
  {
    nombre: 'Federico',
    apellido: 'Díaz',
    email: 'federico.diaz@example.com',
    domicilio: 'Rivadavia 312',
    localidad: 'Salta',
    telefono: '+54 387 431-2244',
    actividades: [
      { descripcion: 'Soporte técnico por migración de datos', fechaCompromiso: '2026-10-18', fechaFinalizacion: '2026-10-18' },
      { descripcion: 'Auditoría de seguridad y accesos', fechaCompromiso: '2026-11-10', fechaFinalizacion: null },
    ],
  },
  {
    nombre: 'Gabriela',
    apellido: 'Sosa',
    email: 'gabriela.sosa@example.com',
    domicilio: 'España 945',
    localidad: 'Mar del Plata',
    telefono: '+54 223 480-1122',
    actividades: [
      { descripcion: 'Presentación de propuesta técnica', fechaCompromiso: null, fechaFinalizacion: null },
      { descripcion: 'Coordinación de taller de capacitación', fechaCompromiso: '2026-10-21', fechaFinalizacion: null },
    ],
  },
  {
    nombre: 'Hugo',
    apellido: 'Medina',
    email: 'hugo.medina@example.com',
    domicilio: 'Alvear 560',
    localidad: 'Santa Fe',
    telefono: '+54 342 455-6677',
    actividades: [
      { descripcion: 'Reunión de renovación de licencias', fechaCompromiso: '2026-10-14', fechaFinalizacion: '2026-10-13' },
      { descripcion: 'Firma de adenda contractual', fechaCompromiso: '2026-10-28', fechaFinalizacion: null },
    ],
  },
  {
    nombre: 'Inés',
    apellido: 'Ríos',
    email: 'ines.rios@example.com',
    domicilio: '9 de Julio 1024',
    localidad: 'La Plata',
    telefono: '+54 221 425-9900',
    actividades: [
      { descripcion: 'Primer contacto vía email corporativo', fechaCompromiso: null, fechaFinalizacion: null },
      { descripcion: 'Videollamada de bienvenida', fechaCompromiso: '2026-11-01', fechaFinalizacion: null },
    ],
  },
  {
    nombre: 'Julián',
    apellido: 'Acosta',
    email: 'julian.acosta@example.com',
    domicilio: 'Sarmiento 830',
    localidad: 'Neuquén',
    telefono: '+54 299 448-7733',
    actividades: [
      { descripcion: 'Configuración inicial del entorno en la nube', fechaCompromiso: '2026-10-16', fechaFinalizacion: '2026-10-16' },
      { descripcion: 'Validación de backups automáticos', fechaCompromiso: '2026-10-24', fechaFinalizacion: null },
    ],
  },
];

console.log('Sembrando base de datos MiniCRM...');

for (const c of clientesIniciales) {
  let clienteExistente = db.select().from(clientes).all().find((x) => x.email === c.email);
  if (!clienteExistente) {
    clienteExistente = db
      .insert(clientes)
      .values({
        nombre: c.nombre,
        apellido: c.apellido,
        email: c.email,
        domicilio: c.domicilio,
        localidad: c.localidad,
        telefono: c.telefono,
      })
      .returning()
      .get();
  }

  const actividadesExistentes = db.select().from(actividades).all().filter((a) => a.clienteId === clienteExistente!.id);
  if (actividadesExistentes.length === 0) {
    for (const a of c.actividades) {
      db.insert(actividades)
        .values({
          clienteId: clienteExistente!.id,
          descripcion: a.descripcion,
          fechaCompromiso: a.fechaCompromiso ?? null,
          fechaFinalizacion: a.fechaFinalizacion ?? null,
        })
        .run();
    }
  }
}

console.log('Seed completado con éxito.');
