import { crearApp } from "./api/app.js";
import { createDb, runMigrations } from "./db/client.js";
import { seed } from "./db/seed.js";
import { ClienteRepository } from "./servicios/cliente-repository.js";

const puerto = Number(process.env.PORT ?? 3000);

const db = createDb();
runMigrations(db);

// El repositorio trabaja contra una única conexión: se configura al arrancar,
// antes de cualquier consulta.
ClienteRepository.configurar(db);

// La semilla es idempotente: se puede dejar encendida. SEED=false la omite.
if (process.env.SEED !== "false") {
  const cargado = seed(db);
  console.log(`Semilla: +${cargado.clientesNuevos} clientes, +${cargado.actividadesNuevas} actividades.`);
}

crearApp().listen(puerto, () => {
  console.log(`API REST   http://localhost:${puerto}/api/clientes`);
  console.log(`Interfaz   http://localhost:${puerto}/MiniCRM.html`);
});
