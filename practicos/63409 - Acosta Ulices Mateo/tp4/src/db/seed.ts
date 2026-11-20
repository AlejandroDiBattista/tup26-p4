import { normalizarCliente } from "../services/normalizar.js";
import { db } from "./index.js";
import { actividades, clientes } from "./schema.js";

// Los ids son fijos: al repetir la carga, los registros existentes se ignoran.
const datosClientes = [
  { id: 1, nombre: "Lucía", apellido: "Fernández", email: "lucia.fernandez@example.com", domicilio: "San Martín 123", localidad: "Rosario", telefono: "341-555-0101" },
  { id: 2, nombre: "Martín", apellido: "Gómez", email: "martin.gomez@example.com", domicilio: "Belgrano 456", localidad: "Córdoba", telefono: null },
  { id: 3, nombre: "Sofía", apellido: "López", email: "sofia.lopez@example.com", domicilio: null, localidad: "Mendoza", telefono: "261-555-0103" },
  { id: 4, nombre: "Juan", apellido: "Pérez", email: "juan.perez@example.com", domicilio: null, localidad: null, telefono: null },
  { id: 5, nombre: "Valentina", apellido: "Díaz", email: "valentina.diaz@example.com", domicilio: "Mitre 789", localidad: "La Plata", telefono: "221-555-0105" },
  { id: 6, nombre: "Tomás", apellido: "Romero", email: "tomas.romero@example.com", domicilio: "Rivadavia 1010", localidad: "Buenos Aires", telefono: "11-5555-0106" },
  { id: 7, nombre: "Camila", apellido: "Sosa", email: "camila.sosa@example.com", domicilio: null, localidad: "Salta", telefono: null },
  { id: 8, nombre: "Diego", apellido: "Torres", email: "diego.torres@example.com", domicilio: "Sarmiento 222", localidad: "Tucumán", telefono: "381-555-0108" },
  { id: 9, nombre: "Florencia", apellido: "Ruiz", email: "florencia.ruiz@example.com", domicilio: null, localidad: null, telefono: "342-555-0109" },
  { id: 10, nombre: "Nicolás", apellido: "Álvarez", email: "nicolas.alvarez@example.com", domicilio: "Moreno 333", localidad: "Neuquén", telefono: null },
];

const datosActividades = [
  // Completadas
  { id: 1, clienteId: 1, descripcion: "Enviar presupuesto", fechaCompromiso: "2026-09-01", fechaFinalizacion: "2026-08-30" },
  { id: 2, clienteId: 2, descripcion: "Reunión inicial", fechaCompromiso: "2026-09-10", fechaFinalizacion: "2026-09-10" },
  { id: 3, clienteId: 3, descripcion: "Firmar contrato", fechaCompromiso: "2026-09-15", fechaFinalizacion: "2026-09-18" },
  { id: 4, clienteId: 5, descripcion: "Instalar equipo", fechaCompromiso: null, fechaFinalizacion: "2026-10-02" },
  { id: 5, clienteId: 6, descripcion: "Capacitación", fechaCompromiso: "2026-10-05", fechaFinalizacion: "2026-10-05" },
  { id: 6, clienteId: 8, descripcion: "Entregar factura", fechaCompromiso: "2026-10-10", fechaFinalizacion: "2026-10-09" },
  // Pendientes con fecha
  { id: 7, clienteId: 1, descripcion: "Llamar para seguimiento", fechaCompromiso: "2026-11-05", fechaFinalizacion: null },
  { id: 8, clienteId: 3, descripcion: "Revisar pedido", fechaCompromiso: "2026-11-12", fechaFinalizacion: null },
  { id: 9, clienteId: 4, descripcion: "Visita técnica", fechaCompromiso: "2026-11-20", fechaFinalizacion: null },
  { id: 10, clienteId: 7, descripcion: "Enviar catálogo", fechaCompromiso: "2026-10-30", fechaFinalizacion: null },
  { id: 11, clienteId: 9, descripcion: "Renovar servicio", fechaCompromiso: "2026-12-01", fechaFinalizacion: null },
  // Pendientes sin fecha
  { id: 12, clienteId: 2, descripcion: "Pedir referencias", fechaCompromiso: null, fechaFinalizacion: null },
  { id: 13, clienteId: 5, descripcion: "Encuesta de satisfacción", fechaCompromiso: null, fechaFinalizacion: null },
  { id: 14, clienteId: 8, descripcion: "Actualizar datos de contacto", fechaCompromiso: null, fechaFinalizacion: null },
  { id: 15, clienteId: 10, descripcion: "Coordinar primera reunión", fechaCompromiso: null, fechaFinalizacion: null },
];

await db.insert(clientes).values(datosClientes.map(normalizarCliente)).onConflictDoNothing();
await db.insert(actividades).values(datosActividades).onConflictDoNothing();

console.log("Base de datos sembrada");
