import { db } from './index.ts';
import { clientes, actividades } from './esquema.ts';

await db.delete(actividades);
await db.delete(clientes);

const insertados = await db.insert(clientes).values([
  { nombre: 'Ana García',     email: 'ana.garcia@example.com',     telefono: '381 555 0123', direccion: 'San Martín 450', ciudad: 'Yerba Buena' },
  { nombre: 'Bruno López',    email: 'bruno.lopez@example.com',    telefono: '381 555 0144', direccion: 'Córdoba 1200',   ciudad: 'San Miguel de Tucumán' },
  { nombre: 'Carla Pérez',    email: 'carla.perez@example.com',    telefono: '381 555 0188', direccion: 'Muñecas 870',    ciudad: 'San Miguel de Tucumán' },
  { nombre: 'Diego Ruiz',     email: 'diego.ruiz@example.com',     telefono: '381 555 0199', direccion: 'Lamadrid 230',   ciudad: 'Tafí Viejo' },
  { nombre: 'Elena Torres',   email: 'elena.torres@example.com',   telefono: '381 555 0210', direccion: 'Belgrano 65',    ciudad: 'Yerba Buena' },
  { nombre: 'Federico Díaz',  email: 'federico.diaz@example.com',  telefono: '381 555 0233', direccion: 'Salta 1490',     ciudad: 'San Miguel de Tucumán' },
  { nombre: 'Gabriela Sosa',  email: 'gabriela.sosa@example.com',  telefono: '381 555 0256', direccion: 'Mendoza 780',    ciudad: 'Banda del Río Salí' },
  { nombre: 'Hernán Molina',  email: 'hernan.molina@example.com',  telefono: '381 555 0277', direccion: 'Laprida 55',     ciudad: 'San Miguel de Tucumán' },
]).returning();

const ana = insertados[0]!.id;
const bruno = insertados[1]!.id;

await db.insert(actividades).values([
  { clienteId: ana,   descripcion: 'Consultar nuevas necesidades', fecha: null },
  { clienteId: ana,   descripcion: 'Enviar presupuesto',           fecha: '2026-10-16' },
  { clienteId: ana,   descripcion: 'Llamar para seguimiento',      fecha: '2026-10-22' },
  { clienteId: ana,   descripcion: 'Enviar presentación', completada: true, completadaEl: '2026-10-15' },
  { clienteId: ana,   descripcion: 'Primera reunión',     completada: true, completadaEl: '2026-10-12' },
  { clienteId: bruno, descripcion: 'Agendar visita',              fecha: '2026-10-28' },
]);

console.log(`Listo: ${insertados.length} clientes cargados.`);