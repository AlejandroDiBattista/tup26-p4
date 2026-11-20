// Carga inicial: vacía las tablas y siembra 10 clientes con actividades.
// Se puede ejecutar varias veces: siempre deja la base en el mismo estado, sin duplicados.
import { sql } from "drizzle-orm";
import { db, motor } from "../config/database.js";
import { actividades, clientes, type NuevaActividad, type NuevoCliente } from "./schema.js";

// Las fechas son relativas a hoy para que siempre haya actividades vencidas y futuras.
const DIA = 24 * 60 * 60 * 1000;

/** Fecha de compromiso (YYYY-MM-DD) desplazada `dias` respecto de hoy. */
const enDias = (dias: number) => new Date(Date.now() + dias * DIA).toISOString().slice(0, 10);

/** Fecha y hora ISO de finalización, `dias` atrás. */
const haceDias = (dias: number) => new Date(Date.now() - dias * DIA).toISOString();

type Semilla = NuevoCliente & { actividades: Omit<NuevaActividad, "clienteId">[] };

const semillas: Semilla[] = [
  {
    nombre: "Ana", apellido: "García", email: "ana.garcia@example.com",
    domicilio: "Av. Mate de Luna 1250", localidad: "San Miguel de Tucumán", telefono: "381 455-1020",
    actividades: [
      { descripcion: "Enviar presupuesto anual", fechaCompromiso: enDias(-10), fechaFinalizacion: haceDias(9) },
      { descripcion: "Llamar para confirmar la compra", fechaCompromiso: enDias(3) },
      { descripcion: "Revisar factura pendiente", fechaCompromiso: enDias(-2) },
    ],
  },
  {
    nombre: "Bruno", apellido: "Fernández", email: "bruno.fernandez@example.com",
    domicilio: "San Martín 845", localidad: "Yerba Buena", telefono: "381 433-7788",
    actividades: [
      { descripcion: "Reunión de presentación", fechaCompromiso: enDias(-20), fechaFinalizacion: haceDias(20) },
      { descripcion: "Enviar catálogo de productos", fechaCompromiso: enDias(-18), fechaFinalizacion: haceDias(17) },
      { descripcion: "Pedir referencias comerciales" },
    ],
  },
  {
    nombre: "Carla", apellido: "Martínez", email: "carla.martinez@example.com",
    domicilio: "Belgrano 302", localidad: "Tafí Viejo", telefono: "381 412-9933",
    actividades: [
      { descripcion: "Coordinar visita técnica", fechaCompromiso: enDias(7) },
      { descripcion: "Seguimiento de reclamo", fechaCompromiso: enDias(-5) },
    ],
  },
  {
    nombre: "Diego", apellido: "López", email: "diego.lopez@example.com",
    domicilio: "Laprida 77", localidad: "San Miguel de Tucumán", telefono: null,
    actividades: [
      { descripcion: "Renovar contrato de servicio", fechaCompromiso: enDias(-30), fechaFinalizacion: haceDias(28) },
    ],
  },
  {
    nombre: "Elena", apellido: "Romero", email: "elena.romero@example.com",
    domicilio: null, localidad: "Concepción", telefono: "3865 42-1100",
    actividades: [
      { descripcion: "Enviar propuesta de descuento", fechaCompromiso: enDias(1) },
      { descripcion: "Agendar demo del sistema" },
      { descripcion: "Confirmar datos de facturación", fechaCompromiso: enDias(-1) },
      { descripcion: "Primer contacto telefónico", fechaCompromiso: enDias(-15), fechaFinalizacion: haceDias(15) },
    ],
  },
  {
    nombre: "Federico", apellido: "Sosa", email: "federico.sosa@example.com",
    domicilio: "Junín 1540", localidad: "Banda del Río Salí", telefono: "381 400-5566",
    actividades: [],
  },
  {
    nombre: "Gabriela", apellido: "Díaz", email: "gabriela.diaz@example.com",
    domicilio: "24 de Septiembre 980", localidad: "San Miguel de Tucumán", telefono: "381 477-2211",
    actividades: [
      { descripcion: "Cobrar saldo adeudado", fechaCompromiso: enDias(-12) },
      { descripcion: "Enviar nota de crédito", fechaCompromiso: enDias(-8), fechaFinalizacion: haceDias(6) },
      { descripcion: "Visita de cortesía", fechaCompromiso: enDias(14) },
    ],
  },
  {
    nombre: "Hernán", apellido: "Pérez", email: "hernan.perez@example.com",
    domicilio: "Córdoba 455", localidad: "Lules", telefono: null,
    actividades: [
      { descripcion: "Actualizar datos de contacto" },
      { descripcion: "Capacitación de uso", fechaCompromiso: enDias(5) },
    ],
  },
  {
    nombre: "Inés", apellido: "Ruiz", email: "ines.ruiz@example.com",
    domicilio: "Muñecas 210", localidad: "San Miguel de Tucumán", telefono: "381 466-3344",
    actividades: [
      { descripcion: "Encuesta de satisfacción", fechaCompromiso: enDias(-3), fechaFinalizacion: haceDias(2) },
      { descripcion: "Ofrecer plan premium", fechaCompromiso: enDias(10) },
    ],
  },
  {
    nombre: "Julián", apellido: "Torres", email: "julian.torres@example.com",
    domicilio: "Av. Aconquija 3100", localidad: "Yerba Buena", telefono: "381 488-9900",
    actividades: [
      { descripcion: "Resolver incidencia de entrega", fechaCompromiso: enDias(-7) },
      { descripcion: "Enviar muestras" },
      { descripcion: "Firmar acuerdo de confidencialidad", fechaCompromiso: enDias(-25), fechaFinalizacion: haceDias(24) },
    ],
  },
];

// Limpieza: las actividades se borran también por cascada, pero se vacían explícitamente.
await db.delete(actividades);
await db.delete(clientes);
// Reinicia los autoincrementales para que los ids vuelvan a empezar en 1.
await db.run(sql`delete from sqlite_sequence where name in ('clientes', 'actividades')`);

let totalActividades = 0;
for (const { actividades: lista, ...cliente } of semillas) {
  const [{ id }] = await db.insert(clientes).values(cliente).returning({ id: clientes.id });
  if (lista.length > 0) {
    await db.insert(actividades).values(lista.map((a) => ({ ...a, clienteId: id })));
    totalActividades += lista.length;
  }
}

console.log(`Seed OK en ${motor}: ${semillas.length} clientes, ${totalActividades} actividades.`);
