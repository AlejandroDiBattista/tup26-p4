import { db } from "./index.ts";
import { actividades, clientes } from "./schema.ts";

const muestra = [
  {
    nombre: "Ana",
    apellido: "García",
    email: "ana.garcia@example.com",
    domicilio: "San Martín 450",
    localidad: "Yerba Buena",
    telefono: "381 555 0123",
    acts: [
      { descripcion: "Consultar nuevas necesidades" },
      { descripcion: "Enviar presupuesto", fechaCompromiso: "2026-10-16" },
      { descripcion: "Llamar para seguimiento", fechaCompromiso: "2026-10-22" },
      {
        descripcion: "Enviar presentación",
        fechaCompromiso: "2026-10-10",
        fechaFinalizacion: "2026-10-15",
      },
      {
        descripcion: "Primera reunión",
        fechaCompromiso: "2026-10-08",
        fechaFinalizacion: "2026-10-12",
      },
    ],
  },
  {
    nombre: "Bruno",
    apellido: "López",
    email: "bruno.lopez@example.com",
    domicilio: "Belgrano 120",
    localidad: "San Miguel de Tucumán",
    telefono: "381 555 0144",
    acts: [
      { descripcion: "Enviar catálogo actualizado", fechaCompromiso: "2026-10-20" },
      {
        descripcion: "Reunión inicial",
        fechaCompromiso: "2026-09-30",
        fechaFinalizacion: "2026-10-02",
      },
    ],
  },
  {
    nombre: "Carla",
    apellido: "Pérez",
    email: "carla.perez@example.com",
    domicilio: "Sarmiento 88",
    localidad: "Tafí Viejo",
    telefono: "381 555 0188",
    acts: [
      { descripcion: "Confirmar datos de facturación" },
      { descripcion: "Visita técnica", fechaCompromiso: "2026-10-18" },
    ],
  },
  {
    nombre: "Diego",
    apellido: "Ruiz",
    email: "diego.ruiz@example.com",
    domicilio: "24 de Septiembre 1500",
    localidad: "San Miguel de Tucumán",
    telefono: "381 555 0201",
    acts: [
      { descripcion: "Preparar propuesta comercial", fechaCompromiso: "2026-10-28" },
      {
        descripcion: "Llamada de presentación",
        fechaCompromiso: "2026-10-05",
        fechaFinalizacion: "2026-10-06",
      },
    ],
  },
  {
    nombre: "Elena",
    apellido: "Torres",
    email: "elena.torres@example.com",
    domicilio: "Congreso 340",
    localidad: "Yerba Buena",
    telefono: "381 555 0220",
    acts: [
      { descripcion: "Enviar contrato para firma", fechaCompromiso: "2026-10-15" },
      { descripcion: "Aclarar alcance del servicio" },
    ],
  },
  {
    nombre: "Federico",
    apellido: "Díaz",
    email: "federico.diaz@example.com",
    domicilio: "Lavalle 210",
    localidad: "San Miguel de Tucumán",
    telefono: "381 555 0233",
    acts: [
      { descripcion: "Seguimiento postventa", fechaCompromiso: "2026-11-02" },
      {
        descripcion: "Alta en el sistema",
        fechaCompromiso: "2026-10-01",
        fechaFinalizacion: "2026-10-03",
      },
    ],
  },
  {
    nombre: "Gabriela",
    apellido: "Sosa",
    email: "gabriela.sosa@example.com",
    domicilio: "Mate de Luna 2400",
    localidad: "San Miguel de Tucumán",
    telefono: "381 555 0245",
    acts: [
      { descripcion: "Reunión con gerencia", fechaCompromiso: "2026-10-30" },
      { descripcion: "Enviar casos de éxito" },
    ],
  },
  {
    nombre: "Hugo",
    apellido: "Martínez",
    email: "hugo.martinez@example.com",
    domicilio: "Alem 55",
    localidad: "Tafí Viejo",
    telefono: "381 555 0260",
    acts: [
      { descripcion: "Cotizar ampliación", fechaCompromiso: "2026-10-12" },
      {
        descripcion: "Demo del producto",
        fechaCompromiso: "2026-09-28",
        fechaFinalizacion: "2026-09-29",
      },
    ],
  },
  {
    nombre: "Irene",
    apellido: "Castro",
    email: "irene.castro@example.com",
    domicilio: "Muñecas 780",
    localidad: "Yerba Buena",
    telefono: "381 555 0271",
    acts: [
      { descripcion: "Revisar pendientes del trimestre" },
      { descripcion: "Agendar capacitación", fechaCompromiso: "2026-11-05" },
    ],
  },
  {
    nombre: "Julián",
    apellido: "Vega",
    email: "julian.vega@example.com",
    domicilio: "Crisóstomo Álvarez 900",
    localidad: "San Miguel de Tucumán",
    telefono: "381 555 0288",
    acts: [
      { descripcion: "Enviar factura A", fechaCompromiso: "2026-10-19" },
      {
        descripcion: "Onboarding",
        fechaCompromiso: "2026-10-04",
        fechaFinalizacion: "2026-10-07",
      },
    ],
  },
];

const yaHay = await db.select().from(clientes).limit(1);
if (yaHay.length > 0) {
  console.log("La base ya tiene datos, no se vuelve a sembrar.");
  process.exit(0);
}

for (const c of muestra) {
  const { acts, ...datos } = c;
  const [cliente] = await db.insert(clientes).values(datos).returning();
  await db.insert(actividades).values(
    acts.map((a) => ({ ...a, clienteId: cliente.id })),
  );
}

console.log("Semilla lista: 10 clientes.");
process.exit(0);
