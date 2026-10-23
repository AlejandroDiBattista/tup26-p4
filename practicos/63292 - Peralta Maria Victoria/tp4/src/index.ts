import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inicializar } from "./db/index.js";
import { clientesRouter } from "./routers/clientes.router.js";
import { manejadorErrores } from "./controllers/clientes.controller.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

await inicializar();

const app = express();
app.use(express.json());
app.use(express.static(publicDir));

app.use("/api/clientes", clientesRouter);

app.get("/", (_req, res) => {
  res.redirect("/MiniCRM.html");
});

app.use(manejadorErrores);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`MiniCRM en http://localhost:${PORT}`);
});
