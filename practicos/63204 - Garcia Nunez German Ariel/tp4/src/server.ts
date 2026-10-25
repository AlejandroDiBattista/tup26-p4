import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { initDb } from "./db/index.js";
import actividadesRouter from "./routes/actividades.routes.js";
import clientesRouter from "./routes/clientes.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Servir archivos estáticos desde 'public'
const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath));

// Rutas de API REST
app.use("/api/clientes", clientesRouter);
app.use("/api", actividadesRouter);

// Redirigir la raíz a MiniCRM.html
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "MiniCRM.html"));
});

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Servidor MiniCRM corriendo en http://localhost:${PORT}`);
      console.log(`Aplicación disponible en http://localhost:${PORT}/MiniCRM.html`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

start();
