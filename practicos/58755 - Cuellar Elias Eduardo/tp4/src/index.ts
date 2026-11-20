import { crearApp } from "./app.js";
import { config } from "./config.js";

const servidor = crearApp().listen(config.port, () => {
  console.log(`MiniCRM escuchando en http://localhost:${config.port} (base: ${config.databaseUrl})`);
});

servidor.on("error", (error) => {
  console.error("No se pudo iniciar el servidor:", error.message);
  process.exit(1);
});

// Cierre ordenado: deja terminar las solicitudes en curso.
for (const senal of ["SIGINT", "SIGTERM"] as const) {
  process.once(senal, () => {
    console.log(`\n${senal} recibido, cerrando servidor...`);
    servidor.close(() => process.exit(0));
  });
}
