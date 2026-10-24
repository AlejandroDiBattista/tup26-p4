import { eq } from "drizzle-orm";
import { db } from "./db/index.js";
import { actividades, clientes } from "./db/schema.js";

const clientesSeed = [
  {
    nombre: "Ana",
    apellido: "Gómez",
    email: "ana.gomez@email.com",
    domicilio: "San Martín 123",
    localidad: "San Miguel de Tucumán",
    telefono: "3815551001",
    actividades: [
      {
        descripcion: "Enviar presupuesto",
        fechaCompromiso: "2026-10-20",
        fechaFinalizacion: "2026-10-20",
      },
      {
        descripcion: "Llamar para confirmar pedido",
        fechaCompromiso: "2026-10-25",
        fechaFinalizacion: null,
      },
    ],
  },
  {
    nombre: "Carlos",
    apellido: "Pérez",
    email: "carlos.perez@email.com",
    domicilio: "Maipú 456",
    localidad: "San Miguel de Tucumán",
    telefono: "3815551002",
    actividades: [
      {
        descripcion: "Presentar propuesta comercial",
        fechaCompromiso: "2026-10-15",
        fechaFinalizacion: "2026-10-15",
      },
      {
        descripcion: "Enviar documentación",
        fechaCompromiso: "2026-10-22",
        fechaFinalizacion: null,
      },
    ],
  },
  {
    nombre: "Laura",
    apellido: "Rodríguez",
    email: "laura.rodriguez@email.com",
    domicilio: "Belgrano 789",
    localidad: "Yerba Buena",
    telefono: "3815551003",
    actividades: [
      {
        descripcion: "Contactar al cliente",
        fechaCompromiso: "2026-10-10",
        fechaFinalizacion: null,
      },
    ],
  },
  {
    nombre: "Martín",
    apellido: "López",
    email: "martin.lopez@email.com",
    domicilio: "Rivadavia 321",
    localidad: "San Miguel de Tucumán",
    telefono: "3815551004",
    actividades: [
      {
        descripcion: "Reunión de seguimiento",
        fechaCompromiso: "2026-10-18",
        fechaFinalizacion: "2026-10-18",
      },
      {
        descripcion: "Preparar nueva propuesta",
        fechaCompromiso: "2026-10-30",
        fechaFinalizacion: null,
      },
    ],
  },
  {
    nombre: "Sofía",
    apellido: "Fernández",
    email: "sofia.fernandez@email.com",
    domicilio: null,
    localidad: "Tafí Viejo",
    telefono: "3815551005",
    actividades: [
      {
        descripcion: "Enviar información solicitada",
        fechaCompromiso: null,
        fechaFinalizacion: "2026-10-05",
      },
    ],
  },
  {
    nombre: "Diego",
    apellido: "Martínez",
    email: "diego.martinez@email.com",
    domicilio: "Laprida 654",
    localidad: "San Miguel de Tucumán",
    telefono: "3815551006",
    actividades: [
      {
        descripcion: "Realizar llamada comercial",
        fechaCompromiso: "2026-10-12",
        fechaFinalizacion: null,
      },
      {
        descripcion: "Confirmar datos",
        fechaCompromiso: "2026-10-28",
        fechaFinalizacion: null,
      },
    ],
  },
  {
    nombre: "Valentina",
    apellido: "Sánchez",
    email: "valentina.sanchez@email.com",
    domicilio: "Las Heras 987",
    localidad: "Yerba Buena",
    telefono: null,
    actividades: [
      {
        descripcion: "Actualizar información del cliente",
        fechaCompromiso: null,
        fechaFinalizacion: null,
      },
    ],
  },
  {
    nombre: "Federico",
    apellido: "Díaz",
    email: "federico.diaz@email.com",
    domicilio: "Junín 147",
    localidad: "San Miguel de Tucumán",
    telefono: "3815551008",
    actividades: [
      {
        descripcion: "Enviar contrato",
        fechaCompromiso: "2026-10-08",
        fechaFinalizacion: "2026-10-09",
      },
    ],
  },
  {
    nombre: "Camila",
    apellido: "Torres",
    email: "camila.torres@email.com",
    domicilio: "25 de Mayo 258",
    localidad: "Banda del Río Salí",
    telefono: "3815551009",
    actividades: [
      {
        descripcion: "Llamar para coordinar reunión",
        fechaCompromiso: "2026-10-23",
        fechaFinalizacion: null,
      },
    ],
  },
  {
    nombre: "Julián",
    apellido: "Acosta",
    email: "julian.acosta@email.com",
    domicilio: null,
    localidad: "San Miguel de Tucumán",
    telefono: "3815551010",
    actividades: [
      {
        descripcion: "Revisar propuesta",
        fechaCompromiso: "2026-10-19",
        fechaFinalizacion: null,
      },
      {
        descripcion: "Primer contacto",
        fechaCompromiso: null,
        fechaFinalizacion: "2026-10-01",
      },
    ],
  },
];

async function seed() {
  for (const clienteData of clientesSeed) {
    const existente = db
      .select()
      .from(clientes)
      .where(eq(clientes.email, clienteData.email))
      .get();

    if (existente) {
      console.log(`El cliente ${clienteData.email} ya existe. Se omite.`);
      continue;
    }

    const resultado = db
      .insert(clientes)
      .values({
        nombre: clienteData.nombre,
        apellido: clienteData.apellido,
        email: clienteData.email,
        domicilio: clienteData.domicilio,
        localidad: clienteData.localidad,
        telefono: clienteData.telefono,
      })
      .returning()
      .get();

    for (const actividad of clienteData.actividades) {
      db.insert(actividades)
        .values({
          clienteId: resultado.id,
          descripcion: actividad.descripcion,
          fechaCompromiso: actividad.fechaCompromiso,
          fechaFinalizacion: actividad.fechaFinalizacion,
        })
        .run();
    }
  }

  console.log("Seed completado correctamente.");
}

seed();