import { Clientes, type DatosCliente } from "../services/clientes.service";
import { hoy, normalizarEmail } from "../services/normalizar";

/** Fecha relativa a hoy: dias(-3) = hace 3 días. */
function dias(n: number): string {
  const d = new Date(`${hoy()}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

type ActividadSeed = { descripcion: string; compromiso?: number; completada?: number };

// Datos deliberadamente "desprolijos" para que se vea la normalización.
const datos: (DatosCliente & { actividades: ActividadSeed[] })[] = [
  {
    nombre: "  ana  maría ", apellido: "GÓMEZ", email: "Ana.Gomez@Mail.com",
    domicilio: "Av. Mate de Luna 1234", localidad: "san miguel de tucumán", telefono: "(381) 555-1234",
    actividades: [
      { descripcion: "Enviar presupuesto de mantenimiento", compromiso: 3 },
      { descripcion: "Llamar para confirmar visita", compromiso: -2 },
      { descripcion: "Reunión inicial", compromiso: -10, completada: -9 },
    ],
  },
  {
    nombre: "carlos", apellido: "pérez", email: "carlos.perez@empresa.com.ar",
    domicilio: "San Martín 450", localidad: "Yerba Buena", telefono: "+54 9 381 444-2211",
    actividades: [
      { descripcion: "Preparar contrato anual" },
      { descripcion: "Visita técnica", compromiso: 7 },
    ],
  },
  {
    nombre: "Lucía", apellido: "Fernández", email: "LUCIA.FERNANDEZ@GMAIL.COM",
    localidad: "Tafí Viejo", telefono: "381-15-666-7788",
    actividades: [
      { descripcion: "Enviar catálogo actualizado", compromiso: -5 },
      { descripcion: "Primer contacto telefónico", compromiso: -20, completada: -20 },
      { descripcion: "Envío de muestras", completada: -3 },
    ],
  },
  {
    nombre: "jorge luis", apellido: "rodríguez", email: "jrodriguez@hotmail.com",
    domicilio: "Laprida 89", localidad: "Concepción",
    actividades: [{ descripcion: "Seguimiento de reclamo", compromiso: 0 }],
  },
  {
    nombre: "Sofía", apellido: "Martínez", email: "sofia.martinez@outlook.com",
    domicilio: "Belgrano 2100", localidad: "San Miguel de Tucumán", telefono: "3814123456",
    actividades: [
      { descripcion: "Renovación de suscripción", compromiso: 15 },
      { descripcion: "Capacitación de uso", compromiso: -1, completada: -1 },
    ],
  },
  {
    nombre: "MARTÍN", apellido: "lópez", email: "martin.lopez@empresa.com",
    localidad: "Banda del Río Salí", telefono: "381 400 1122",
    actividades: [
      { descripcion: "Cobrar factura pendiente", compromiso: -7 },
      { descripcion: "Revisar propuesta comercial" },
    ],
  },
  {
    nombre: "valentina", apellido: "díaz", email: "vale.diaz@gmail.com",
    domicilio: "Junín 777", localidad: "Lules",
    actividades: [{ descripcion: "Alta en el sistema", compromiso: -30, completada: -28 }],
  },
  {
    nombre: "Diego", apellido: "Sánchez", email: "diego.sanchez@yahoo.com",
    domicilio: "Córdoba 1500", localidad: "Yerba Buena", telefono: "+54 381 422-9988",
    actividades: [
      { descripcion: "Demostración del producto", compromiso: 2 },
      { descripcion: "Enviar encuesta de satisfacción" },
      { descripcion: "Instalación", compromiso: -15, completada: -14 },
    ],
  },
  {
    nombre: "camila", apellido: "torres", email: "camila.torres@empresa.com.ar",
    localidad: "famaillá",
    actividades: [],
  },
  {
    nombre: "Pablo", apellido: "Romero", email: "pablo.romero@gmail.com",
    domicilio: "24 de Septiembre 300", localidad: "San Miguel de Tucumán", telefono: "0381-430-5566",
    actividades: [
      { descripcion: "Negociar descuento por volumen", compromiso: 10 },
      { descripcion: "Llamar por pago atrasado", compromiso: -4 },
    ],
  },
];

async function main() {
  let creados = 0;
  for (const { actividades, ...cliente } of datos) {
    // Evita duplicados: el email (normalizado) identifica al cliente.
    const email = normalizarEmail(cliente.email);
    const existentes = await Clientes.buscar({ email });
    if (existentes.some((c) => c.email === email)) continue;

    const { id } = await Clientes.crear(cliente);
    for (const a of actividades) {
      const act = await Clientes.crearActividad(id, {
        descripcion: a.descripcion,
        fechaCompromiso: a.compromiso === undefined ? null : dias(a.compromiso),
      });
      if (a.completada !== undefined) await Clientes.completarActividad(id, act.id, dias(a.completada));
    }
    creados++;
  }
  console.log(`Seed: ${creados} clientes creados, ${datos.length - creados} ya existían.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
