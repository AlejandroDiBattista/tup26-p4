import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { count } from 'drizzle-orm';
import * as esquema from './esquema.js';
import { clientes, actividades } from './esquema.js';

const sqlite = new Database('minicrm.db');

sqlite.pragma('foreign_keys = ON');

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    domicilio TEXT,
    localidad TEXT
  );

  CREATE TABLE IF NOT EXISTS actividades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    fecha_compromiso TEXT,
    fecha_finalizacion TEXT
  );
`);

export const db = drizzle(sqlite, { schema: esquema });

export function sembrarBaseDeDatos(): void {
  const resultado = db.select({ total: count() }).from(clientes).get();
  if (resultado && resultado.total > 0) {
    return;
  }

  const clientesIniciales = [
    {
      nombre: 'Ana',
      apellido: 'García',
      email: 'ana.garcia@example.com',
      telefono: '381 555 0123',
      domicilio: 'San Martín 450',
      localidad: 'Yerba Buena',
      actividades: [
        {
          descripcion: 'Consultar nuevas necesidades',
          fechaCompromiso: null,
          fechaFinalizacion: null,
        },
        {
          descripcion: 'Enviar presupuesto',
          fechaCompromiso: '2026-10-16',
          fechaFinalizacion: null,
        },
        {
          descripcion: 'Llamar para seguimiento',
          fechaCompromiso: '2026-10-28',
          fechaFinalizacion: null,
        },
        {
          descripcion: 'Enviar presentación',
          fechaCompromiso: '2026-10-14',
          fechaFinalizacion: '2026-10-15',
        },
        {
          descripcion: 'Primera reunión',
          fechaCompromiso: '2026-10-12',
          fechaFinalizacion: '2026-10-12',
        },
      ],
    },
    {
      nombre: 'Bruno',
      apellido: 'López',
      email: 'bruno.lopez@example.com',
      telefono: '381 555 0234',
      domicilio: 'Av. Aconquija 1200',
      localidad: 'Yerba Buena',
      actividades: [
        {
          descripcion: 'Coordinar demostración del sistema',
          fechaCompromiso: '2026-10-29',
          fechaFinalizacion: null,
        },
        {
          descripcion: 'Revisión de contrato inicial',
          fechaCompromiso: '2026-10-10',
          fechaFinalizacion: '2026-10-11',
        },
      ],
    },
    {
      nombre: 'Carla',
      apellido: 'Pérez',
      email: 'carla.perez@example.com',
      telefono: '381 555 0345',
      domicilio: '25 de Mayo 320',
      localidad: 'San Miguel de Tucumán',
      actividades: [
        {
          descripcion: 'Actualizar datos de facturación',
          fechaCompromiso: null,
          fechaFinalizacion: null,
        },
        {
          descripcion: 'Renovar suscripción anual',
          fechaCompromiso: '2026-10-18',
          fechaFinalizacion: null,
        },
      ],
    },
    {
      nombre: 'Diego',
      apellido: 'Ruiz',
      email: 'diego.ruiz@example.com',
      telefono: '381 555 0456',
      domicilio: 'Laprida 680',
      localidad: 'San Miguel de Tucumán',
      actividades: [
        {
          descripcion: 'Enviar propuesta técnica actualizada',
          fechaCompromiso: '2026-11-02',
          fechaFinalizacion: null,
        },
        {
          descripcion: 'Relevamiento de requerimientos',
          fechaCompromiso: '2026-10-08',
          fechaFinalizacion: '2026-10-09',
        },
      ],
    },
    {
      nombre: 'Elena',
      apellido: 'Torres',
      email: 'elena.torres@example.com',
      telefono: '381 555 0567',
      domicilio: 'Av. Mate de Luna 2100',
      localidad: 'San Miguel de Tucumán',
      actividades: [
        {
          descripcion: 'Confirmar asistencia a capacitación',
          fechaCompromiso: '2026-10-30',
          fechaFinalizacion: null,
        },
        {
          descripcion: 'Alta de cuenta corporativa',
          fechaCompromiso: '2026-10-05',
          fechaFinalizacion: '2026-10-06',
        },
      ],
    },
    {
      nombre: 'Federico',
      apellido: 'Díaz',
      email: 'federico.diaz@example.com',
      telefono: '381 555 0678',
      domicilio: 'Congreso 150',
      localidad: 'Tafí Viejo',
      actividades: [
        {
          descripcion: 'Validar integración con sistema contable',
          fechaCompromiso: '2026-10-19',
          fechaFinalizacion: null,
        },
        {
          descripcion: 'Envío de credenciales de prueba',
          fechaCompromiso: '2026-10-13',
          fechaFinalizacion: '2026-10-13',
        },
      ],
    },
    {
      nombre: 'Gabriela',
      apellido: 'Sosa',
      email: 'gabriela.sosa@example.com',
      telefono: '381 555 0789',
      domicilio: 'Rivadavia 890',
      localidad: 'Banda del Río Salí',
      actividades: [
        {
          descripcion: 'Agendar llamada de cierre comercial',
          fechaCompromiso: null,
          fechaFinalizacion: null,
        },
        {
          descripcion: 'Presentación de catálogo de servicios',
          fechaCompromiso: '2026-10-11',
          fechaFinalizacion: '2026-10-12',
        },
      ],
    },
  ];

  for (const item of clientesIniciales) {
    const clienteInsertado = db
      .insert(clientes)
      .values({
        nombre: item.nombre,
        apellido: item.apellido,
        email: item.email,
        telefono: item.telefono,
        domicilio: item.domicilio,
        localidad: item.localidad,
      })
      .returning()
      .get();

    for (const act of item.actividades) {
      db.insert(actividades)
        .values({
          clienteId: clienteInsertado.id,
          descripcion: act.descripcion,
          fechaCompromiso: act.fechaCompromiso,
          fechaFinalizacion: act.fechaFinalizacion,
        })
        .run();
    }
  }
}
