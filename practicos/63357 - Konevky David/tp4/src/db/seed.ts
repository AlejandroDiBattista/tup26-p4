import { db } from './index.js';
import { clientes, actividades } from './schema.js';

type Act = [descripcion: string, compromiso: string | null, finalizacion?: string];

const datos: [typeof clientes.$inferInsert, Act[]][] = [
  [{ nombre: 'Lucía', apellido: 'Fernández', email: 'lucia.fernandez@example.com', domicilio: 'Av. Mitre 120', localidad: 'Tucumán', telefono: '381-4001001' }, [
    ['Enviar presupuesto', '2026-09-15', '2026-09-14'],
    ['Llamar para seguimiento', '2026-11-05'],
  ]],
  [{ nombre: 'Martín', apellido: 'Gómez', email: 'martin.gomez@example.com', localidad: 'Salta', telefono: '387-4002002' }, [
    ['Reunión de relevamiento', '2026-10-01', '2026-10-01'],
    ['Enviar contrato', null],
  ]],
  [{ nombre: 'Sofía', apellido: 'Ramírez', email: 'sofia.ramirez@example.com', domicilio: 'Belgrano 450', localidad: 'Tucumán' }, [
    ['Demo del producto', '2026-10-28'],
  ]],
  [{ nombre: 'Javier', apellido: 'Pérez', email: 'javier.perez@example.com', telefono: '11-4003003' }, [
    ['Renovar licencia', '2026-08-30', '2026-08-29'],
    ['Cobrar factura 0012', '2026-09-10', '2026-09-20'],
    ['Pedir referencias', null],
  ]],
  [{ nombre: 'Camila', apellido: 'Torres', email: 'camila.torres@example.com', domicilio: 'San Martín 77', localidad: 'Córdoba', telefono: '351-4004004' }, []],
  [{ nombre: 'Diego', apellido: 'Silva', email: 'diego.silva@example.com', localidad: 'Rosario' }, [
    ['Capacitación inicial', '2026-10-12', '2026-10-12'],
  ]],
  [{ nombre: 'Valentina', apellido: 'Castro', email: 'valentina.castro@example.com', domicilio: 'Rivadavia 900', localidad: 'Mendoza', telefono: '261-4005005' }, [
    ['Visita a sucursal', '2026-11-12'],
    ['Enviar catálogo', null, '2026-10-02'],
  ]],
  [{ nombre: 'Nicolás', apellido: 'Herrera', email: 'nicolas.herrera@example.com', telefono: '381-4006006' }, [
    ['Resolver reclamo', '2026-10-20'],
  ]],
  [{ nombre: 'Agustina', apellido: 'Molina', email: 'agustina.molina@example.com', localidad: 'Tucumán' }, [
    ['Actualizar datos fiscales', null],
    ['Confirmar reunión', '2026-10-25', '2026-10-18'],
  ]],
  [{ nombre: 'Tomás', apellido: 'Ruiz', email: 'tomas.ruiz@example.com', domicilio: 'Sarmiento 33', localidad: 'La Plata', telefono: '221-4007007' }, [
    ['Propuesta de ampliación', '2026-12-01'],
  ]],
];

// El email es único: si el cliente ya existe no se inserta ni se le repiten actividades.
for (const [cliente, acts] of datos) {
  const [nuevo] = await db.insert(clientes).values(cliente).onConflictDoNothing().returning({ id: clientes.id });
  if (!nuevo) continue;
  for (const [descripcion, fechaCompromiso, fechaFinalizacion] of acts) {
    await db.insert(actividades).values({
      clienteId: nuevo.id, descripcion, fechaCompromiso, fechaFinalizacion: fechaFinalizacion ?? null,
    });
  }
}

console.log('Seed listo:', (await db.select().from(clientes)).length, 'clientes');
