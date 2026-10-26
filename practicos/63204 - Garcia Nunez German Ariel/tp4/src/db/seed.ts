// Importamos la función de inicialización de la base de datos
import { initDb } from "./index.js";

// Importamos la clase Clientes para reutilizar sus métodos y reglas de negocio
import { Clientes } from "../services/clientes.js";

// Función principal para poblar la base de datos con los datos de ejemplo de minicrm.jpg
async function sembrarDatos() {
  console.log("Iniciando carga de datos de ejemplo...");

  // Nos aseguramos de que las tablas existan en la base de datos SQLite
  await initDb();

  // Lista de clientes y actividades idénticos a los mostrados en la imagen de referencia minicrm.jpg
  const listaClientes = [
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
          fechaCompromiso: null, // Sin fecha
          completada: false,
        },
        {
          descripcion: "Enviar presupuesto",
          fechaCompromiso: "2026-10-16", // Vencida respecto a la fecha actual
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
          completada: true, // Completada el 15 oct 2026
        },
        {
          descripcion: "Primera reunión",
          fechaCompromiso: "2026-10-12",
          completada: true, // Completada el 12 oct 2026
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
          descripcion: "Revisar especificaciones técnicas",
          fechaCompromiso: "2026-10-28",
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
      actividades: [],
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

  // Recorremos cada cliente e insertamos si no existe previamente
  for (const item of listaClientes) {
    try {
      // Creamos el cliente utilizando el servicio
      const cliente = await Clientes.crear({
        nombre: item.nombre,
        apellido: item.apellido,
        email: item.email,
        telefono: item.telefono,
        domicilio: item.domicilio,
        localidad: item.localidad,
      });

      // Insertamos cada una de las actividades del cliente
      for (const act of item.actividades) {
        const actividadCreada = await Clientes.crearActividad(cliente.id, {
          descripcion: act.descripcion,
          fechaCompromiso: act.fechaCompromiso,
        });

        // Si la actividad fue configurada como completada, la marcamos como tal
        if (act.completada) {
          await Clientes.completarActividad(actividadCreada.id);
        }
      }

      console.log(` Cliente creado: ${cliente.nombre} ${cliente.apellido}`);
    } catch (error: any) {
      // Si el email ya existía, simplemente lo salteamos sin detener el script
      console.log(` Omitiendo ${item.nombre} ${item.apellido}: ${error.message}`);
    }
  }

  console.log("Carga de datos finalizada.");
  process.exit(0);
}

// Ejecutamos la función de sembrado
sembrarDatos().catch((error) => {
  console.error("Error al sembrar datos:", error);
  process.exit(1);
});
