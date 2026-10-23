import { createDb, runMigrations } from "./db/client.js";
import { seed } from "./db/seed.js";
import { ClienteRepository } from "./servicios/cliente-repository.js";

// 1. Base de datos + migraciones + semilla (idempotente).
const db = createDb();
runMigrations(db);
ClienteRepository.configurar(db);

const cargado = seed(db);
console.log(`Semilla: +${cargado.clientesNuevos} clientes, +${cargado.actividadesNuevas} actividades.\n`);

// 2. Búsqueda libre: un texto, en cualquiera de los campos.
console.log("Buscando 'rosario':", ClienteRepository.buscar("rosario").map((c) => c.apellido));
console.log("Buscando 'gó':", ClienteRepository.buscar("gó").map((c) => `${c.apellido}, ${c.nombre}`));
console.log("Buscando '+54223':", ClienteRepository.buscar("+54223").map((c) => c.apellido));

// 3. Componente 1:n: un cliente con sus actividades.
const primero = ClienteRepository.listar()[0];
if (!primero) throw new Error("No hay clientes cargados.");

const detalle = ClienteRepository.conActividades(primero.id);
console.log(`\nCliente: ${detalle?.nombre} ${detalle?.apellido} <${detalle?.email}> ${detalle?.telefono ?? ""}`);
console.table(
  detalle?.actividades.map((a) => ({
    descripcion: a.descripcion,
    estado: ClienteRepository.estaCompletada(a) ? "completada" : ClienteRepository.estaVencida(a) ? "vencida" : "pendiente",
    compromiso: a.fechaCompromiso?.toISOString().slice(0, 10) ?? "-",
    finalizacion: a.fechaFinalizacion?.toISOString().slice(0, 10) ?? "-",
  })),
);

// 4. Las actividades se consultan siempre a través de su cliente.
const vencidas = ClienteRepository.listarActividades(primero.id, { estado: "vencida" });
console.log(`\nVencidas de ${primero.apellido}: ${vencidas.length}`);
console.log(ClienteRepository.resumen(primero.id));

// 5. Tablero: como no hay acceso global a actividades, se recorre cliente por cliente.
console.log("\nTablero:");
console.table(
  ClienteRepository.listar().map((c) => ({
    cliente: `${c.apellido}, ${c.nombre}`,
    ...ClienteRepository.resumen(c.id).actividades,
  })),
);
