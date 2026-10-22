import { app } from "./app.js";
import { sembrarDatosIniciales } from "./db/seed.js";

const PUERTO = process.env.PORT ? Number(process.env.PORT) : 3000;

async function iniciarServidor() {
  try {
    await sembrarDatosIniciales();
    app.listen(PUERTO, () => {
      console.log(`MiniCRM en http://localhost:${PUERTO}/MiniCRM.html`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

iniciarServidor();
