import { and, eq } from "drizzle-orm";
import { actividades, clientes } from "./schema.js";
import { db } from "./index.js";

const alumnosC1 = [
  { nombre: "Ulices Mateo", apellido: "Acosta", telefono: "(381)236-4228", email: "alumno01@example.invalid" },
  { nombre: "Tomás Emilio", apellido: "Albornoz", telefono: "(381)548-4231", email: "alumno02@example.invalid" },
  { nombre: "Juan Ignacio", apellido: "Andina", telefono: "(381)688-1813", email: "alumno03@example.invalid" },
  { nombre: "María José", apellido: "Andrada", telefono: "(381)597-3350", email: "alumno04@example.invalid" },
  { nombre: "Nahu", apellido: "Barroca", telefono: "(381)522-9389", email: "alumno05@example.invalid" },
  { nombre: "Fernando Sebastián", apellido: "Cabrera", telefono: "(381)524-8576", email: "alumno06@example.invalid" },
  { nombre: "Leonidas Tiziano", apellido: "Carobbio Bestani", telefono: "(381)566-5305", email: "alumno07@example.invalid" },
  { nombre: "Sofía", apellido: "Cequi", telefono: "(381)467-0231", email: "alumno08@example.invalid" },
  { nombre: "Rocco", apellido: "Chirieleison Bonkosky", telefono: "(381)480-3869", email: "alumno09@example.invalid" },
  { nombre: "Lisandro", apellido: "Civili de la Vega", telefono: "(381)617-4315", email: "alumno10@example.invalid" },
];

const actividadesDePrueba = [
  {
    descripcion: "Actividad de prueba: pendiente sin fecha",
    fechaCompromiso: null,
    fechaFinalizacion: null,
  },
  {
    descripcion: "Actividad de prueba: vencida",
    fechaCompromiso: new Date("2026-01-15T12:00:00.000Z"),
    fechaFinalizacion: null,
  },
  {
    descripcion: "Actividad de prueba: futura",
    fechaCompromiso: new Date("2030-12-15T12:00:00.000Z"),
    fechaFinalizacion: null,
  },
  {
    descripcion: "Actividad de prueba: completada",
    fechaCompromiso: new Date("2026-01-01T12:00:00.000Z"),
    fechaFinalizacion: new Date("2026-01-05T12:00:00.000Z"),
  },
];

db.transaction((tx) => {
  alumnosC1.forEach((alumno, index) => {
    const [clienteExistente] = tx
      .select({ id: clientes.id })
      .from(clientes)
      .where(eq(clientes.email, alumno.email))
      .limit(1)
      .all();

    let clienteId: number;
    const datosCliente = {
      nombre: alumno.nombre,
      apellido: alumno.apellido,
      email: alumno.email,
      telefono: alumno.telefono,
      domicilio: null,
      localidad: null,
    };

    if (clienteExistente) {
      clienteId = clienteExistente.id;
      tx.update(clientes).set(datosCliente).where(eq(clientes.id, clienteId)).run();
    } else {
      const [nuevoCliente] = tx.insert(clientes).values(datosCliente).returning({ id: clientes.id }).all();
      clienteId = nuevoCliente.id;
    }

    const actividad = actividadesDePrueba[index % actividadesDePrueba.length];
    const [actividadExistente] = tx
      .select({ id: actividades.id })
      .from(actividades)
      .where(and(eq(actividades.clienteId, clienteId), eq(actividades.descripcion, actividad.descripcion)))
      .limit(1)
      .all();

    if (actividadExistente) {
      tx.update(actividades)
        .set(actividad)
        .where(eq(actividades.id, actividadExistente.id))
        .run();
    } else {
      tx.insert(actividades).values({ clienteId, ...actividad }).run();
    }
  });
});

console.log("Seed local aplicado: 10 clientes y 10 actividades de prueba.");
