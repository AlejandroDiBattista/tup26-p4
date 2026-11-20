import type { NuevaActividad, NuevoCliente } from './schema.js';

export const clientesFicticios: NuevoCliente[] = [
  { nombre: 'Ana', apellido: 'Pérez', email: 'ana.perez@example.com', domicilio: 'San Martín 120', localidad: 'San Miguel de Tucumán', telefono: '3815550101' },
  { nombre: 'Bruno', apellido: 'Gómez', email: 'bruno.gomez@example.com', localidad: 'Yerba Buena' },
  { nombre: 'Carla', apellido: 'López', email: 'carla.lopez@example.com', telefono: '3815550103' },
  { nombre: 'Diego', apellido: 'Ruiz', email: 'diego.ruiz@example.com', domicilio: 'Belgrano 450', localidad: 'Tafí Viejo' },
  { nombre: 'Elena', apellido: 'Torres', email: 'elena.torres@example.com' },
  { nombre: 'Federico', apellido: 'Díaz', email: 'federico.diaz@example.com', localidad: 'Concepción', telefono: '3865550106' },
  { nombre: 'Gabriela', apellido: 'Sosa', email: 'gabriela.sosa@example.com', domicilio: 'Maipú 830' },
  { nombre: 'Hugo', apellido: 'Medina', email: 'hugo.medina@example.com', localidad: 'Monteros' },
  { nombre: 'Inés', apellido: 'Vega', email: 'ines.vega@example.com', domicilio: 'Rivadavia 210', localidad: 'Aguilares', telefono: '3865550109' },
  { nombre: 'Julián', apellido: 'Castro', email: 'julian.castro@example.com' },
];

export const actividadesFicticias: Omit<NuevaActividad, 'clienteId'>[] = [
  { descripcion: 'Reunión inicial', fechaCompromiso: '2026-10-01', fechaFinalizacion: '2026-10-01' },
  { descripcion: 'Registrar preferencias', fechaCompromiso: null, fechaFinalizacion: '2026-10-05' },
  { descripcion: 'Enviar propuesta', fechaCompromiso: '2026-10-25', fechaFinalizacion: null },
  { descripcion: 'Consultar nuevas necesidades', fechaCompromiso: null, fechaFinalizacion: null },
];
