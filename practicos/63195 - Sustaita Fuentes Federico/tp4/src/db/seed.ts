import { db } from './index';
import { actividades, clientes } from './schema';

const datos = [
  ['Ana', 'García', 'ana.garcia@example.com', '381 555 0123', 'San Martín 450', 'Yerba Buena'],
  ['Bruno', 'López', 'bruno.lopez@example.com', '381 555 0456', 'Mate de Luna 1200', 'San Miguel de Tucumán'],
  ['Carla', 'Pérez', 'carla.perez@example.com', '381 555 0789', 'Aconquija 300', 'Yerba Buena'],
  ['Diego', 'Ruiz', 'diego.ruiz@example.com', '381 555 1011', '24 de Septiembre 800', 'San Miguel de Tucumán'],
  ['Elena', 'Torres', 'elena.torres@example.com', '381 555 1213', 'Belgrano 55', 'Tafí Viejo'],
  ['Federico', 'Díaz', 'federico.diaz@example.com', '381 555 1415', 'Perón 2100', 'Yerba Buena'],
  ['Gabriela', 'Sosa', 'gabriela.sosa@example.com', '381 555 1617', 'Sarmiento 640', 'Banda del Río Salí'],
];

export function sembrar() {
  const hay = db.select({ id: clientes.id }).from(clientes).limit(1).all();
  if (hay.length) return;

  for (const [nombre, apellido, email, telefono, direccion, ciudad] of datos) {
    db.insert(clientes).values({ nombre, apellido, email, telefono, direccion, ciudad }).run();
  }

  db.insert(actividades).values([
    { clienteId: 1, descripcion: 'Primera reunión', completada: true, completadaEl: '2026-10-12' },
    { clienteId: 1, descripcion: 'Enviar presentación', completada: true, completadaEl: '2026-10-15' },
    { clienteId: 1, descripcion: 'Enviar presupuesto', fecha: '2026-10-16' },
    { clienteId: 1, descripcion: 'Llamar para seguimiento', fecha: '2026-10-22' },
    { clienteId: 1, descripcion: 'Consultar nuevas necesidades' },
    { clienteId: 2, descripcion: 'Coordinar demo del sistema', fecha: '2026-10-30' },
    { clienteId: 4, descripcion: 'Renovar contrato anual', fecha: '2026-11-05' },
  ]).run();

  console.log('Base sembrada con datos de ejemplo');
}

if (import.meta.url === `file://${process.argv[1]}`) sembrar();
