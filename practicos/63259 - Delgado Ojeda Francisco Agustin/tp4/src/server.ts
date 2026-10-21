import { app } from "./app.js";
import { sembrarDatosIniciales } from "./db/seed.js";

const PUERTO = process.env.PORT ? Number(process.env.PORT) : 3000;

async function iniciarServidor() {
  try {
    // Asegurar estructura de tablas y datos iniciales de prueba
    await sembrarDatosIniciales();

    app.listen(PUERTO, () => {
      console.log(`\n MiniCRM ejecutándose en: http://localhost:${PUERTO}`);
      console.log(` Interfaz web: http://localhost:${PUERTO}/MiniCRM.html`);
      console.log(` API REST:     http://localhost:${PUERTO}/api/clientes\n`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor de MiniCRM:", error);
    process.exit(1);
  }
}

iniciarServidor();
