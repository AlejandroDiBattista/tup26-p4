import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { clientesRouter } from "./routes/clientes.routes.js";
import { sembrarDatosDeEjemplo } from "./db/seed.js";

const app = express();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use("/api", clientesRouter);
app.use(express.static(path.resolve(currentDirectory, "../public")));
app.get("/api/health", (_request, response) => response.json({ ok: true }));

async function iniciarServidor() {
  const seSembraronDatos = await sembrarDatosDeEjemplo();
  if (seSembraronDatos) console.log("Datos de ejemplo cargados.");

  app.listen(config.port, () => {
    console.log(`MiniCRM disponible en http://localhost:${config.port}`);
  });
}

iniciarServidor().catch((error) => {
  console.error("No se pudo iniciar MiniCRM:", error);
  process.exit(1);
});
