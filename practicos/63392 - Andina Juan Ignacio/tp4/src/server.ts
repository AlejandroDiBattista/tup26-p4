import express from "express";
import path from "node:path";
import { manejarErrores } from "./controllers/comun";
import apiRouter from "./routes";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);
const publicDir = path.join(process.cwd(), "public");

app.use(express.json());
app.use(express.static(publicDir));

app.get("/", (_req, res) => {
  res.sendFile(path.join(publicDir, "MiniCRM.html"));
});

app.use("/api", apiRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Recurso no encontrado" });
});

app.use(manejarErrores);

app.listen(PORT, () => {
  console.log(`MiniCRM en http://localhost:${PORT}`);
});
