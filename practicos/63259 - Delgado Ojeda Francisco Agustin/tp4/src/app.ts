import express from "express";
import cors from "cors";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { apiRouter } from "./routes/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicPath = resolve(__dirname, "../public");

export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(publicPath));

app.use("/api", apiRouter);

app.get("/", (_req, res) => {
  res.sendFile(resolve(publicPath, "MiniCRM.html"));
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor.",
  });
});
