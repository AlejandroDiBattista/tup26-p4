import { fileURLToPath } from "node:url";
import { ClienteRepository } from "../servicios/cliente-repository.js";
import { createDb, runMigrations, type Db } from "./client.js";

const DIA = 24 * 60 * 60 * 1000;
/** Fechas relativas a hoy: negativo = pasado, positivo = futuro. */
const enDias = (dias: number) => new Date(Date.now() + dias * DIA);

type ActividadSemilla = {
  descripcion: string;
  /** Días respecto de hoy. Omitir = actividad sin fecha de compromiso. */
  compromiso?: number;
  /** Días respecto de hoy. Omitir = actividad pendiente. */
  finalizacion?: number;
};

type ClienteSemilla = {
  nombre: string;
  apellido: string;
  email: string;
  domicilio?: string;
  localidad?: string;
  telefono?: string;
  actividades: ActividadSemilla[];
};

export const SEMILLA: ClienteSemilla[] = [
  {
    nombre: "Ana",
    apellido: "Gómez",
    email: "ana.gomez@example.com",
    domicilio: "Av. Rivadavia 1234",
    localidad: "Buenos Aires",
    telefono: "+54 11 5555-1001",
    actividades: [
      { descripcion: "Firmar contrato de servicio", compromiso: -30, finalizacion: -28 },
      { descripcion: "Enviar documentación", compromiso: -10, finalizacion: -9 },
      { descripcion: "Reunión de seguimiento", compromiso: 7 },
      { descripcion: "Definir alcance del proyecto" },
    ],
  },
  {
    nombre: "Bruno",
    apellido: "Fernández",
    email: "bruno.fernandez@example.com",
    localidad: "Rosario",
    telefono: "+54 341 555-2002",
    actividades: [
      { descripcion: "Alta en el sistema", compromiso: -45, finalizacion: -45 },
      { descripcion: "Capacitación inicial", compromiso: -2 },
      { descripcion: "Revisar facturación del mes" },
    ],
  },
  {
    nombre: "Carla",
    apellido: "Ibáñez",
    email: "carla.ibanez@example.com",
    domicilio: "Calle Mitre 567",
    localidad: "Córdoba",
    actividades: [
      { descripcion: "Diagnóstico técnico", compromiso: -20, finalizacion: -18 },
      { descripcion: "Instalar equipamiento", compromiso: -5, finalizacion: -3 },
      { descripcion: "Pruebas de aceptación", compromiso: 14 },
    ],
  },
  {
    nombre: "Diego",
    apellido: "Pereyra",
    email: "diego.pereyra@example.com",
    domicilio: "Av. Colón 890",
    localidad: "La Plata",
    telefono: "+54 221 555-3003",
    actividades: [
      { descripcion: "Relevamiento de necesidades", compromiso: -60, finalizacion: -58 },
      { descripcion: "Presupuesto aprobado", compromiso: -40, finalizacion: -40 },
      { descripcion: "Entrega de informe", compromiso: 3 },
    ],
  },
  {
    nombre: "Elena",
    apellido: "Quiroga",
    email: "elena.quiroga@example.com",
    telefono: "+54 261 555-4004",
    actividades: [
      { descripcion: "Contacto inicial", compromiso: -15, finalizacion: -15 },
      { descripcion: "Enviar propuesta comercial", compromiso: 5 },
      { descripcion: "Acordar forma de pago" },
    ],
  },
  {
    nombre: "Facundo",
    apellido: "Ríos",
    email: "facundo.rios@example.com",
    domicilio: "Bv. Oroño 2100",
    localidad: "Rosario",
    telefono: "+54 341 555-5005",
    actividades: [
      { descripcion: "Migración de datos", compromiso: -25, finalizacion: -21 },
      { descripcion: "Ajustes de configuración", compromiso: -1 },
      { descripcion: "Cierre de etapa 1", compromiso: 21 },
    ],
  },
  {
    nombre: "Gabriela",
    apellido: "Sosa",
    email: "gabriela.sosa@example.com",
    domicilio: "Calle San Martín 456",
    localidad: "Mendoza",
    telefono: "+54 261 555-6006",
    actividades: [
      { descripcion: "Auditoría de accesos", compromiso: -50, finalizacion: -49 },
      { descripcion: "Revisión legal del contrato", compromiso: -35, finalizacion: -33 },
      { descripcion: "Firma digital pendiente", compromiso: 10 },
    ],
  },
  {
    nombre: "Hernán",
    apellido: "Molina",
    email: "hernan.molina@example.com",
    localidad: "Santa Fe",
    telefono: "+54 342 555-7007",
    actividades: [
      { descripcion: "Alta de usuario en portal", compromiso: -8, finalizacion: -8 },
      { descripcion: "Confirmar domicilio de entrega" },
    ],
  },
  {
    nombre: "Inés",
    apellido: "Cabrera",
    email: "ines.cabrera@example.com",
    domicilio: "Av. Luro 3300",
    localidad: "Mar del Plata",
    telefono: "+54 223 555-8008",
    actividades: [
      { descripcion: "Soporte post-venta", compromiso: -90, finalizacion: -88 },
      { descripcion: "Encuesta de satisfacción", compromiso: -7, finalizacion: -6 },
      { descripcion: "Renovación anual", compromiso: 30 },
    ],
  },
  {
    nombre: "Javier",
    apellido: "Ledesma",
    email: "javier.ledesma@example.com",
    actividades: [
      { descripcion: "Verificar datos de contacto", compromiso: -3 },
      { descripcion: "Llamar para agendar visita" },
    ],
  },
];

export type ResultadoSeed = {
  clientesNuevos: number;
  actividadesNuevas: number;
  clientesTotales: number;
  actividadesTotales: number;
};

/**
 * Carga la semilla de forma idempotente: repetirla no duplica filas ni
 * mueve fechas. La composición se respeta al construir cada actividad
 * sobre su cliente, y las completadas se marcan con `completarActividad`.
 */
export function seed(db: Db): ResultadoSeed {
  ClienteRepository.configurar(db);

  let clientesNuevos = 0;
  let actividadesNuevas = 0;

  for (const { actividades: pendientes, ...datosCliente } of SEMILLA) {
    const { cliente, creado } = ClienteRepository.asegurar(datosCliente);
    if (creado) clientesNuevos++;

    for (const item of pendientes) {
      const { actividad, creada } = ClienteRepository.asegurarActividad(cliente.id, {
        descripcion: item.descripcion,
        fechaCompromiso: item.compromiso === undefined ? null : enDias(item.compromiso),
      });
      if (creada) actividadesNuevas++;

      if (item.finalizacion !== undefined) {
        ClienteRepository.completarActividad(cliente.id, actividad.id, enDias(item.finalizacion));
      }
    }
  }

  // No hay conteo global de actividades: se suman las de cada cliente.
  const actividadesTotales = ClienteRepository.listar().reduce(
    (total, cliente) => total + ClienteRepository.contarActividades(cliente.id),
    0,
  );

  return {
    clientesNuevos,
    actividadesNuevas,
    clientesTotales: ClienteRepository.contar(),
    actividadesTotales,
  };
}

// Ejecución directa: `npm run db:seed`.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const db = createDb();
  runMigrations(db);

  const r = seed(db);
  console.log(`Clientes: ${r.clientesNuevos} nuevos, ${r.clientesTotales} en total.`);
  console.log(`Actividades: ${r.actividadesNuevas} nuevas, ${r.actividadesTotales} en total.`);
}
