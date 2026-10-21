import express from "express";
import cors from "cors";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { apiRouter } from "./routes/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicPath = resolve(__dirname, "../public");

export const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Archivos estáticos de la interfaz web
app.use(express.static(publicPath));

// Rutas de la API REST
app.use("/api", apiRouter);

// Redirigir la raíz hacia MiniCRM.html
app.get("/", (_req, res) => {
  res.sendFile(resolve(publicPath, "MiniCRM.html"));
});

// Manejo de ruta API no encontrada
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Ruta de API no encontrada." });
});

// Manejo centralizado de errores
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Error no controlado:", err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Error interno del servidor.",
  });
});
