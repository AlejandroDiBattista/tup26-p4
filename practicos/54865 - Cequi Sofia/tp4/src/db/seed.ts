import { db } from "./index.js";
import { clientes, actividades } from "./schema.js";

async function seed() {
  console.log("Cargando datos iniciales...");

  // Limpiar tablas previas
  db.delete(actividades).run();
  db.delete(clientes).run();

  const c1 = db.insert(clientes).values({
    nombre: "Ana",
    apellido: "García",
    email: "ana.garcia@example.com",
    telefono: "381 555 0123",
    domicilio: "San Martín 450",
    localidad: "Yerba Buena"
  }).returning().get();

  const c2 = db.insert(clientes).values({
    nombre: "Bruno",
    apellido: "López",
    email: "bruno.lopez@example.com",
    telefono: "381 444 0987",
    domicilio: "Av. Aconquija 1200",
    localidad: "Yerba Buena"
  }).returning().get();

  const c3 = db.insert(clientes).values({
    nombre: "Carla",
    apellido: "Pérez",
    email: "carla.perez@example.com",
    telefono: "381 777 5432",
    domicilio: "25 de Mayo 320",
    localidad: "San Miguel de Tucumán"
  }).returning().get();

  const c4 = db.insert(clientes).values({
    nombre: "Diego",
    apellido: "Ruiz",
    email: "diego.ruiz@example.com",
    telefono: "381 888 2341",
    domicilio: "Congreso 150",
    localidad: "San Miguel de Tucumán"
  }).returning().get();

  const c5 = db.insert(clientes).values({
    nombre: "Elena",
    apellido: "Torres",
    email: "elena.torres@example.com",
    telefono: "381 222 9012",
    domicilio: "Laprida 680",
    localidad: "San Miguel de Tucumán"
  }).returning().get();

  const c6 = db.insert(clientes).values({
    nombre: "Federico",
    apellido: "Díaz",
    email: "federico.diaz@example.com",
    telefono: "381 333 4567",
    domicilio: "Muñecas 890",
    localidad: "Tafí Viejo"
  }).returning().get();

  const c7 = db.insert(clientes).values({
    nombre: "Gabriela",
    apellido: "Sosa",
    email: "gabriela.sosa@example.com",
    telefono: "381 666 7890",
    domicilio: "Belgrano 210",
    localidad: "Banda del Río Salí"
  }).returning().get();

  // Actividades para Ana García (como se observa en minicrm.jpg)
  if (c1) {
    db.insert(actividades).values([
      {
        clienteId: c1.id,
        descripcion: "Consultar nuevas necesidades",
        fechaCompromiso: null,
        fechaFinalizacion: null
      },
      {
        clienteId: c1.id,
        descripcion: "Enviar presupuesto",
        fechaCompromiso: "2026-10-16",
        fechaFinalizacion: null
      },
      {
        clienteId: c1.id,
        descripcion: "Llamar para seguimiento",
        fechaCompromiso: "2026-10-22",
        fechaFinalizacion: null
      },
      {
        clienteId: c1.id,
        descripcion: "Enviar presentación",
        fechaCompromiso: "2026-10-15",
        fechaFinalizacion: "2026-10-15"
      },
      {
        clienteId: c1.id,
        descripcion: "Primera reunión",
        fechaCompromiso: "2026-10-12",
        fechaFinalizacion: "2026-10-12"
      }
    ]).run();
  }

  console.log("Datos de prueba cargados correctamente.");
}

seed();

