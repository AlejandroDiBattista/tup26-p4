import type { NuevaActividad, NuevoCliente } from "./schema.js";

type ActividadSeed = Omit<NuevaActividad, "id" | "clienteId">;
type ClienteSeed = Omit<NuevoCliente, "id"> & { actividades: ActividadSeed[] };

// Datos ficticios. Combina actividades completadas (con fechaFinalizacion),
// pendientes con fecha comprometida y pendientes sin fecha.
export const clientesSeed: ClienteSeed[] = [
  {
    nombre: "Valentina", apellido: "Herrera", email: "valentina.herrera@example.com",
    domicilio: "Av. Sarmiento 1240", localidad: "San Miguel de Tucumán", telefono: "381-555-0101",
    actividades: [
      { descripcion: "Reunión de relevamiento", fechaCompromiso: "2026-09-02", fechaFinalizacion: "2026-09-02" },
      { descripcion: "Enviar propuesta comercial", fechaCompromiso: "2026-10-28" },
      { descripcion: "Pedir referencias de otros proveedores" },
    ],
  },
  {
    nombre: "Joaquín", apellido: "Paz", email: "joaquin.paz@example.com",
    localidad: "Yerba Buena", telefono: "381-555-0102",
    actividades: [
      { descripcion: "Llamada de presentación", fechaCompromiso: "2026-08-15", fechaFinalizacion: "2026-08-14" },
      { descripcion: "Agendar demo del producto" },
    ],
  },
  {
    nombre: "Camila", apellido: "Ruiz", email: "camila.ruiz@example.com",
    domicilio: "San Martín 455", localidad: "Salta", telefono: "387-555-0103",
    actividades: [
      { descripcion: "Firma de contrato", fechaCompromiso: "2026-07-10", fechaFinalizacion: "2026-07-12" },
      { descripcion: "Capacitación inicial", fechaCompromiso: "2026-07-20", fechaFinalizacion: "2026-07-20" },
      { descripcion: "Encuesta de satisfacción", fechaCompromiso: "2026-11-05" },
    ],
  },
  {
    nombre: "Mateo", apellido: "Sosa", email: "mateo.sosa@example.com",
    actividades: [{ descripcion: "Primer contacto por correo" }],
  },
  {
    nombre: "Lucía", apellido: "Medina", email: "lucia.medina@example.com",
    domicilio: "Belgrano 980", localidad: "Córdoba", telefono: "351-555-0105",
    actividades: [
      { descripcion: "Visita a la oficina", fechaCompromiso: "2026-10-30" },
      { descripcion: "Revisar presupuesto con gerencia", fechaCompromiso: "2026-11-12" },
    ],
  },
  {
    nombre: "Tomás", apellido: "Gómez", email: "tomas.gomez@example.com",
    localidad: "Rosario", telefono: "341-555-0106",
    actividades: [
      { descripcion: "Instalación del sistema", fechaCompromiso: "2026-06-01", fechaFinalizacion: "2026-06-03" },
      { descripcion: "Soporte post-instalación", fechaCompromiso: "2026-06-10", fechaFinalizacion: "2026-06-09" },
    ],
  },
  {
    nombre: "Martina", apellido: "Díaz", email: "martina.diaz@example.com",
    domicilio: "Mitre 77", localidad: "Mendoza",
    actividades: [
      { descripcion: "Negociar condiciones de pago" },
      { descripcion: "Enviar factura proforma", fechaCompromiso: "2026-10-25" },
    ],
  },
  {
    nombre: "Santiago", apellido: "Torres", email: "santiago.torres@example.com",
    telefono: "11-5555-0108",
    actividades: [
      { descripcion: "Renovación anual", fechaCompromiso: "2026-01-15", fechaFinalizacion: "2026-01-14" },
      { descripcion: "Ofrecer plan premium" },
    ],
  },
  {
    nombre: "Agustina", apellido: "Romero", email: "agustina.romero@example.com",
    domicilio: "Rivadavia 3100", localidad: "Buenos Aires", telefono: "11-5555-0109",
    actividades: [],
  },
  {
    nombre: "Facundo", apellido: "Molina", email: "facundo.molina@example.com",
    localidad: "Santiago del Estero", telefono: "385-555-0110",
    actividades: [
      { descripcion: "Demo virtual", fechaCompromiso: "2026-09-20", fechaFinalizacion: "2026-09-21" },
      { descripcion: "Enviar caso de éxito", fechaCompromiso: "2026-11-01" },
      { descripcion: "Seguimiento telefónico" },
    ],
  },
];
