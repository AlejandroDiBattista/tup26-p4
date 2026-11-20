type Act = { descripcion: string; fechaCompromiso?: string; fechaFinalizacion?: string };
type Seed = {
  nombre: string;
  apellido: string;
  email: string;
  domicilio?: string;
  localidad?: string;
  telefono?: string;
  actividades: Act[];
};

export const seedData: Seed[] = [
  {
    nombre: "Lucía", apellido: "Fernández", email: "lucia.fernandez@example.com",
    domicilio: "San Martín 123", localidad: "Rosario", telefono: "341-555-0101",
    actividades: [
      { descripcion: "Relevamiento inicial", fechaCompromiso: "2026-03-10", fechaFinalizacion: "2026-03-09" },
      { descripcion: "Enviar presupuesto", fechaCompromiso: "2026-10-01" },
    ],
  },
  {
    nombre: "Martín", apellido: "Gómez", email: "martin.gomez@example.com",
    localidad: "Córdoba",
    actividades: [{ descripcion: "Llamada de seguimiento" }],
  },
  {
    nombre: "Sofía", apellido: "Rodríguez", email: "sofia.rodriguez@example.com",
    domicilio: "Belgrano 456", localidad: "Mendoza", telefono: "261-555-0103",
    actividades: [
      { descripcion: "Instalación de equipos", fechaCompromiso: "2026-05-20", fechaFinalizacion: "2026-05-22" },
      { descripcion: "Capacitación al personal", fechaCompromiso: "2026-06-01", fechaFinalizacion: "2026-06-01" },
      { descripcion: "Revisión trimestral" },
    ],
  },
  {
    nombre: "Diego", apellido: "Pérez", email: "diego.perez@example.com",
    telefono: "11-5555-0104",
    actividades: [],
  },
  {
    nombre: "Valentina", apellido: "López", email: "valentina.lopez@example.com",
    domicilio: "Mitre 789", localidad: "La Plata",
    actividades: [
      { descripcion: "Migrar datos", fechaCompromiso: "2026-12-01" },
      { descripcion: "Entrega de informe", fechaCompromiso: "2026-02-15", fechaFinalizacion: "2026-02-14" },
    ],
  },
  {
    nombre: "Joaquín", apellido: "Martínez", email: "joaquin.martinez@example.com",
    localidad: "Salta", telefono: "387-555-0106",
    actividades: [{ descripcion: "Reunión de kickoff", fechaCompromiso: "2026-01-12", fechaFinalizacion: "2026-01-12" }],
  },
  {
    nombre: "Camila", apellido: "Sánchez", email: "camila.sanchez@example.com",
    domicilio: "Rivadavia 1010", localidad: "Tucumán",
    actividades: [
      { descripcion: "Auditoría de seguridad" },
      { descripcion: "Renovar contrato", fechaCompromiso: "2026-09-30" },
    ],
  },
  {
    nombre: "Facundo", apellido: "Romero", email: "facundo.romero@example.com",
    domicilio: "Alem 55", localidad: "Neuquén", telefono: "299-555-0108",
    actividades: [
      { descripcion: "Soporte técnico", fechaCompromiso: "2026-09-01", fechaFinalizacion: "2026-09-03" },
    ],
  },
  {
    nombre: "Julieta", apellido: "Díaz", email: "julieta.diaz@example.com",
    localidad: "Mar del Plata",
    actividades: [
      { descripcion: "Diseño de propuesta", fechaCompromiso: "2026-04-18", fechaFinalizacion: "2026-04-17" },
      { descripcion: "Seguimiento postventa" },
    ],
  },
  {
    nombre: "Nicolás", apellido: "Torres", email: "nicolas.torres@example.com",
    domicilio: "Sarmiento 300", localidad: "Santa Fe", telefono: "342-555-0110",
    actividades: [
      { descripcion: "Alta en el sistema", fechaCompromiso: "2026-07-07", fechaFinalizacion: "2026-07-07" },
      { descripcion: "Facturación mensual", fechaCompromiso: "2026-11-30" },
    ],
  },
];
