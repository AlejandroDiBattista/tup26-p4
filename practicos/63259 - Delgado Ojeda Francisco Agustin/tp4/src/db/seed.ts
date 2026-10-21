import { db, inicializarBaseDeDatos } from "./index.js";
import { clientes, actividades } from "./schema.js";
import { count } from "drizzle-orm";

export async function sembrarDatosIniciales() {
  await inicializarBaseDeDatos();
  const [totalClientes] = await db.select({ total: count() }).from(clientes);
  if (totalClientes && totalClientes.total > 0) {
    return; // Ya hay datos sembrados
  }

  console.log("Sembrando datos iniciales para el MiniCRM...");

  // Insertar clientes iniciales basados en la maqueta
  const [c1, c2, c3, c4, c5, c6, c7] = await db
    .insert(clientes)
    .values([
      {
        nombre: "Ana Garcia",
        email: "ana.garcia@example.com",
        telefono: "381 555 0123",
        domicilio: "San Martin 450, Yerba Buena",
      },
      {
        nombre: "Bruno López",
        email: "bruno.lopez@example.com",
        telefono: "381 555 0244",
        domicilio: "Av. Aconquija 1200, Yerba Buena",
      },
      {
        nombre: "Carla Pérez",
        email: "carla.perez@example.com",
        telefono: "381 555 0389",
        domicilio: "25 de Mayo 320, San Miguel de Tucumán",
      },
      {
        nombre: "Diego Ruiz",
        email: "diego.ruiz@example.com",
        telefono: "381 555 0412",
        domicilio: "Laprida 680, San Miguel de Tucumán",
      },
      {
        nombre: "Elena Torres",
        email: "elena.torres@example.com",
        telefono: "381 555 0567",
        domicilio: "Av. Belgrano 2100, San Miguel de Tucumán",
      },
      {
        nombre: "Federico Diaz",
        email: "federico.diaz@example.com",
        telefono: "381 555 0633",
        domicilio: "Crisóstomo Álvarez 450, San Miguel de Tucumán",
      },
      {
        nombre: "Gabriela Sosa",
        email: "gabriela.sosa@example.com",
        telefono: "381 555 0791",
        domicilio: "Sarmiento 800, Concepción",
      },
    ])
    .returning();

  // Actividades para Ana García
  await db.insert(actividades).values([
    {
      clienteId: c1.id,
      descripcion: "Consultar nuevas necesidades",
      fecha: null,
      completada: false,
    },
    {
      clienteId: c1.id,
      descripcion: "Enviar presupuesto",
      fecha: "2026-10-16",
      completada: false,
    },
    {
      clienteId: c1.id,
      descripcion: "Llamar para seguimiento",
      fecha: "2026-10-22",
      completada: false,
    },
    {
      clienteId: c1.id,
      descripcion: "Enviar presentacion",
      fecha: null,
      completada: true,
      fechaCompletada: "2026-10-15",
    },
    {
      clienteId: c1.id,
      descripcion: "Primera reunión",
      fecha: null,
      completada: true,
      fechaCompletada: "2026-10-12",
    },
  ]);

  // Actividades para Bruno López
  await db.insert(actividades).values([
    {
      clienteId: c2.id,
      descripcion: "Coordinar demo técnica",
      fecha: "2026-10-24",
      completada: false,
    },
    {
      clienteId: c2.id,
      descripcion: "Enviar propuesta comercial",
      fecha: "2026-10-25",
      completada: false,
    },
  ]);

  // Actividades para Carla Pérez
  await db.insert(actividades).values([
    {
      clienteId: c3.id,
      descripcion: "Revisar términos de servicio",
      fecha: "2026-10-23",
      completada: false,
    },
    {
      clienteId: c3.id,
      descripcion: "Firma de contrato",
      fecha: "2026-10-10",
      completada: true,
      fechaCompletada: "2026-10-10",
    },
  ]);

  // Actividades para Diego Ruiz
  await db.insert(actividades).values([
    {
      clienteId: c4.id,
      descripcion: "Actualizar datos de facturación",
      fecha: "2026-10-28",
      completada: false,
    },
  ]);

  // Actividades para Elena Torres
  await db.insert(actividades).values([
    {
      clienteId: c5.id,
      descripcion: "Reunión de inducción",
      fecha: "2026-10-18",
      completada: true,
      fechaCompletada: "2026-10-18",
    },
  ]);

  // Actividades para Federico Diaz
  await db.insert(actividades).values([
    {
      clienteId: c6.id,
      descripcion: "Llamada de prospección",
      fecha: "2026-10-26",
      completada: false,
    },
  ]);

  // Actividades para Gabriela Sosa
  await db.insert(actividades).values([
    {
      clienteId: c7.id,
      descripcion: "Envío de catálogo 2026",
      fecha: "2026-10-20",
      completada: true,
      fechaCompletada: "2026-10-20",
    },
  ]);

  console.log("Siembra de datos iniciales completada con éxito.");
}
