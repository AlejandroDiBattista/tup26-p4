import { initDb } from "./index.js";
import { Clientes } from "../services/clientes.js";

async function seed() {
  console.log("Inicializando base de datos...");
  await initDb();

  console.log("Cargando clientes y actividades de ejemplo...");

  const clientesEjemplo = [
    {
      nombre: "Ana",
      apellido: "García",
      email: "ana.garcia@example.com",
      telefono: "381 555 0123",
      domicilio: "San Martín 450",
      localidad: "Yerba Buena",
      actividades: [
        {
          descripcion: "Consultar nuevas necesidades",
          fechaCompromiso: null,
          completada: false,
        },
        {
          descripcion: "Enviar presupuesto",
          fechaCompromiso: "2026-10-16",
          completada: false,
        },
        {
          descripcion: "Llamar para seguimiento",
          fechaCompromiso: "2026-10-22",
          completada: false,
        },
        {
          descripcion: "Enviar presentación",
          fechaCompromiso: "2026-10-15",
          completada: true,
          fechaFinalizacion: "2026-10-15",
        },
        {
          descripcion: "Primera reunión",
          fechaCompromiso: "2026-10-12",
          completada: true,
          fechaFinalizacion: "2026-10-12",
        },
      ],
    },
    {
      nombre: "Bruno",
      apellido: "López",
      email: "bruno.lopez@example.com",
      telefono: "381 555 0456",
      domicilio: "Av. Aconquija 1200",
      localidad: "Yerba Buena",
      actividades: [
        {
          descripcion: "Revisar requerimientos técnicos",
          fechaCompromiso: "2026-10-25",
          completada: false,
        },
      ],
    },
    {
      nombre: "Carla",
      apellido: "Pérez",
      email: "carla.perez@example.com",
      telefono: "381 555 0789",
      domicilio: "25 de Mayo 320",
      localidad: "San Miguel de Tucumán",
      actividades: [
        {
          descripcion: "Llamada inicial de contacto",
          fechaCompromiso: "2026-10-18",
          completada: true,
          fechaFinalizacion: "2026-10-18",
        },
      ],
    },
    {
      nombre: "Diego",
      apellido: "Ruiz",
      email: "diego.ruiz@example.com",
      telefono: "381 555 0112",
      domicilio: "Crisóstomo Álvarez 650",
      localidad: "San Miguel de Tucumán",
      actividades: [],
    },
    {
      nombre: "Elena",
      apellido: "Torres",
      email: "elena.torres@example.com",
      telefono: "381 555 0334",
      domicilio: "Av. Mate de Luna 2800",
      localidad: "San Miguel de Tucumán",
      actividades: [],
    },
    {
      nombre: "Federico",
      apellido: "Díaz",
      email: "federico.diaz@example.com",
      telefono: "381 555 0556",
      domicilio: "Laprida 150",
      localidad: "San Miguel de Tucumán",
      actividades: [],
    },
    {
      nombre: "Gabriela",
      apellido: "Sosa",
      email: "gabriela.sosa@example.com",
      telefono: "381 555 0778",
      domicilio: "Las Heras 420",
      localidad: "Yerba Buena",
      actividades: [],
    },
  ];

  for (const item of clientesEjemplo) {
    try {
      const cliente = await Clientes.crear({
        nombre: item.nombre,
        apellido: item.apellido,
        email: item.email,
        telefono: item.telefono,
        domicilio: item.domicilio,
        localidad: item.localidad,
      });

      for (const act of item.actividades) {
        const creada = await Clientes.crearActividad(cliente.id, {
          descripcion: act.descripcion,
          fechaCompromiso: act.fechaCompromiso,
        });

        if (act.completada) {
          await Clientes.completarActividad(creada.id);
        }
      }
      console.log(`Cliente creado: ${cliente.nombre} ${cliente.apellido}`);
    } catch (e: any) {
      console.log(`Saltando ${item.nombre} ${item.apellido}: ${e.message}`);
    }
  }

  console.log("Seed completado exitosamente.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});
