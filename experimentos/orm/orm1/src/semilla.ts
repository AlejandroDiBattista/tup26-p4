import { eq } from "drizzle-orm";
import { db } from "./db/index.js";
import { actividades, clientes } from "./db/schema.js";

const datosEjemplo = [
  {
    nombre: "Ana",
    apellido: "García",
    telefono: "+54 11 5555-0101",
    email: "ana.garcia@ejemplo.com",
    actividades: [
      { descripcion: "Llamar para conocer sus necesidades", estado: "completa" as const, dias: -5 },
      { descripcion: "Enviar propuesta comercial", estado: "pendiente" as const, dias: 2 },
      { descripcion: "Confirmar recepción de la propuesta", estado: "pendiente" as const, dias: 5 },
    ],
  },
  {
    nombre: "Juan",
    apellido: "Pérez",
    telefono: "+54 11 5555-0102",
    email: "juan.perez@ejemplo.com",
    actividades: [
      { descripcion: "Reunión inicial", estado: "completa" as const, dias: -10 },
      { descripcion: "Preparar presupuesto", estado: "pendiente" as const, dias: -2 },
      { descripcion: "Contactar por presupuesto vencido", estado: "pendiente" as const, dias: 1 },
    ],
  },
  {
    nombre: "Lucía",
    apellido: "Fernández",
    telefono: "+54 11 5555-0103",
    email: "lucia.fernandez@ejemplo.com",
    actividades: [
      { descripcion: "Registrar consulta por email", estado: "completa" as const, dias: -7 },
      { descripcion: "Compartir catálogo de servicios", estado: "pendiente" as const, dias: 3 },
      { descripcion: "Coordinar demostración", estado: "pendiente" as const, dias: 8 },
    ],
  },
  {
    nombre: "Marcos",
    apellido: "Díaz",
    telefono: "+54 11 5555-0104",
    email: "marcos.diaz@ejemplo.com",
    actividades: [
      { descripcion: "Presentación del producto", estado: "completa" as const, dias: -14 },
      { descripcion: "Enviar contrato para revisión", estado: "pendiente" as const, dias: 4 },
      { descripcion: "Consultar avances de la revisión", estado: "pendiente" as const, dias: 9 },
    ],
  },
  {
    nombre: "Sofía",
    apellido: "López",
    telefono: "+54 11 5555-0105",
    email: "sofia.lopez@ejemplo.com",
    actividades: [
      { descripcion: "Atender consulta inicial", estado: "completa" as const, dias: -3 },
      { descripcion: "Enviar información solicitada", estado: "pendiente" as const, dias: 1 },
      { descripcion: "Agendar seguimiento", estado: "pendiente" as const, dias: 6 },
    ],
  },
];

function fechaRelativa(dias: number) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha;
}

for (const datos of datosEjemplo) {
  const existente = await db
    .select({ id: clientes.id })
    .from(clientes)
    .where(eq(clientes.email, datos.email))
    .get();

  if (existente) continue;

  const [cliente] = await db
    .insert(clientes)
    .values({
      nombre: datos.nombre,
      apellido: datos.apellido,
      telefono: datos.telefono,
      email: datos.email,
    })
    .returning({ id: clientes.id });

  if (!cliente) continue;

  await db.insert(actividades).values(
    datos.actividades.map(({ descripcion, estado, dias }) => ({
      clienteId: cliente.id,
      descripcion,
      estado,
      fecha: fechaRelativa(dias),
      ...(estado === "completa" ? { fechaCompletada: new Date() } : {}),
    })),
  );
}

console.log("Semilla de clientes y actividades cargada (sin duplicar registros existentes).");
