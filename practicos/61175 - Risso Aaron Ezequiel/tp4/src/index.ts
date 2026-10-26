import express from "express";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import clientesRouter from "./routes/clientes.routes.js";
import { manejarErrores } from "./middlewares/errores.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const directorioPublico = join(dirname(fileURLToPath(import.meta.url)), "../public");

app.use(express.json());
app.use("/api/clientes", clientesRouter);
app.use(express.static(directorioPublico));

app.get("/", (_req, res) => {
  res.sendFile(join(directorioPublico, "MiniCRM.html"));
});

app.use((_req, res) => {
  res.status(404).json({
    error: { codigo: "RUTA_NO_ENCONTRADA", mensaje: "La ruta solicitada no existe." },
  });
});

app.use(manejarErrores);

app.listen(port, () => {
  console.log(`MiniCRM escuchando en http://localhost:${port}`);
});
