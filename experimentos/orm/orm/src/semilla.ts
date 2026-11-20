import { and, eq, inArray } from "drizzle-orm";
import { db } from "./db.js";
import {
  actividades,
  clientes,
  type ActividadNueva,
  type ClienteNuevo
} from "./esquema.js";

const contactos: ClienteNuevo[] = [
  { nombre: "Ana", apellido: "Pérez", email: "ana.perez@example.com", telefono: "+5491123456701" },
  { nombre: "Bruno", apellido: "Gómez", email: "bruno.gomez@example.com", telefono: "+5491123456702" },
  { nombre: "Carla", apellido: "Díaz", email: "carla.diaz@example.com", telefono: "+5491123456703" },
  { nombre: "Diego", apellido: "López", email: "diego.lopez@example.com", telefono: "+5491123456704" },
  { nombre: "Elena", apellido: "Suárez", email: "elena.suarez@example.com", telefono: "+5491123456705" },
  { nombre: "Facundo", apellido: "Torres", email: "facundo.torres@example.com", telefono: "+5491123456706" },
  { nombre: "Gabriela", apellido: "Ruiz", email: "gabriela.ruiz@example.com", telefono: "+5491123456707" },
  { nombre: "Hernán", apellido: "Medina", email: "hernan.medina@example.com", telefono: "+5491123456708" },
  { nombre: "Inés", apellido: "Castro", email: "ines.castro@example.com", telefono: "+5491123456709" },
  { nombre: "Julián", apellido: "Herrera", email: "julian.herrera@example.com", telefono: "+5491123456710" }
];

function fechaTucuman(diasDesdeHoy = 0) {
  const partes = new Intl.DateTimeFormat("en", {
    timeZone: "America/Argentina/Tucuman",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const anio = Number(partes.find(parte => parte.type === "year")?.value);
  const mes = Number(partes.find(parte => parte.type === "month")?.value);
  const dia = Number(partes.find(parte => parte.type === "day")?.value);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia + diasDesdeHoy));
  return fecha.toISOString().slice(0, 10);
}

function crearActividades(clienteId: number, indice: number): ActividadNueva[] {
  return [
    {
      clienteId,
      descripcion: `Reunión inicial ${indice + 1}`,
      fecha: fechaTucuman(-14),
      fechaCompromiso: null,
      fechaFinalizacion: new Date().toISOString()
    },
    {
      clienteId,
      descripcion: `Enviar información ${indice + 1}`,
      fecha: fechaTucuman(-2),
      fechaCompromiso: null,
      fechaFinalizacion: null
    },
    {
      clienteId,
      descripcion: `Confirmar propuesta ${indice + 1}`,
      fecha: null,
      fechaCompromiso: fechaTucuman(-3),
      fechaFinalizacion: null
    },
    {
      clienteId,
      descripcion: `Seguimiento ${indice + 1}`,
      fecha: null,
      fechaCompromiso: fechaTucuman(7),
      fechaFinalizacion: null
    }
  ];
}

async function sembrar() {
  for (const [indice, contacto] of contactos.entries()) {
    const [cliente] = await db
      .insert(clientes)
      .values(contacto)
      .onConflictDoUpdate({
        target: clientes.email,
        set: {
          nombre: contacto.nombre,
          apellido: contacto.apellido,
          telefono: contacto.telefono
        }
      })
      .returning({ id: clientes.id });

    const actividadesIniciales = crearActividades(cliente.id, indice);
    const descripciones = actividadesIniciales.map(actividad => actividad.descripcion);
    const existentes = await db
      .select({ descripcion: actividades.descripcion })
      .from(actividades)
      .where(
        and(
          eq(actividades.clienteId, cliente.id),
          inArray(actividades.descripcion, descripciones)
        )
      );
    const descripcionesExistentes = new Set(existentes.map(({ descripcion }) => descripcion));
    const nuevas = actividadesIniciales.filter(
      actividad => !descripcionesExistentes.has(actividad.descripcion)
    );

    if (nuevas.length > 0) {
      await db.insert(actividades).values(nuevas);
    }
  }

  console.log(`Semilla lista: ${contactos.length} clientes y al menos 4 actividades por cliente.`);
}

sembrar()
  .catch(error => {
    console.error("No se pudo cargar la semilla:", error);
    process.exitCode = 1;
  })
  .finally(() => db.$client.close());
