// Carga datos de ejemplo. Borra lo que haya y vuelve a empezar.
import { db } from "./index";
import { eq } from "drizzle-orm";
import { actividades, clientes } from "./schema";
import { Clientes } from "../services/clientes";

/** Fecha AAAA-MM-DD a `dias` de hoy (negativo = en el pasado). */
function enDias(dias: number) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

const ejemplos = [
  { nombre: "Ana García", empresa: "Estudio García", email: "ana.garcia@example.com", telefono: "381 555 0123", direccion: "San Martín 450, Yerba Buena" },
  { nombre: "Bruno López", empresa: "López Hnos.", email: "bruno.lopez@example.com", telefono: "381 555 0456", direccion: "Av. Mate de Luna 1800" },
  { nombre: "Carla Pérez", empresa: "Panadería La Espiga", email: "carla.perez@example.com", telefono: "381 555 0789", direccion: "Congreso 230" },
  { nombre: "Diego Ruiz", empresa: "Ruiz Logística", email: "diego.ruiz@example.com", telefono: "381 555 1011", direccion: "Ruta 9 km 1301, Tafí Viejo" },
  { nombre: "Elena Torres", empresa: "Torres Arquitectura", email: "elena.torres@example.com", telefono: "381 555 1213", direccion: "Laprida 75" },
  { nombre: "Federico Díaz", empresa: "Díaz Seguros", email: "federico.diaz@example.com", telefono: "381 555 1415", direccion: "24 de Septiembre 960" },
  { nombre: "Gabriela Sosa", empresa: "Sosa Indumentaria", email: "gabriela.sosa@example.com", telefono: "381 555 1617", direccion: "Muñecas 410" },
  { nombre: "Hernán Medina", empresa: "Medina Ferretería", email: "hernan.medina@example.com", telefono: "381 555 1819", direccion: "Av. Aconquija 1200, Yerba Buena" },
  { nombre: "Inés Juárez", empresa: "Clínica Juárez", email: "ines.juarez@example.com", telefono: "381 555 2021", direccion: "Córdoba 640" },
  { nombre: "Julián Ferreyra", empresa: "Ferreyra Software", email: "julian.ferreyra@example.com", telefono: "381 555 2223", direccion: "Lamadrid 315", notas: "Prefiere contacto por WhatsApp." },
];

/** Crea una actividad y la completa como si hubiera sido hace `dias` días. */
function completadaHace(clienteId: number, descripcion: string, dias: number) {
  const actividad = Clientes.agregarActividad(clienteId, { descripcion, fecha: enDias(-dias) });
  Clientes.completarActividad(actividad.id);
  db.update(actividades).set({ completadaEn: enDias(-dias) }).where(eq(actividades.id, actividad.id)).run();
}

db.delete(actividades).run();
db.delete(clientes).run();

for (const datos of ejemplos) {
  const cliente = Clientes.crear(datos);

  Clientes.agregarActividad(cliente.id, { descripcion: "Llamar para seguimiento", fecha: enDias(3) });
  Clientes.agregarActividad(cliente.id, { descripcion: "Enviar presupuesto", fecha: enDias(-2) });
  Clientes.agregarActividad(cliente.id, { descripcion: "Consultar nuevas necesidades" });

  completadaHace(cliente.id, "Primera reunión", 12);
  completadaHace(cliente.id, "Enviar presentación", 8);
}

console.log(`✓ ${ejemplos.length} clientes con 5 actividades cada uno (3 pendientes y 2 completadas)`);
