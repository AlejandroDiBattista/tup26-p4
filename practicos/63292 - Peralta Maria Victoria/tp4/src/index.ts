import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inicializar } from "./db/index.js";
import { clientesRouter, actividadesRouter } from "./routers/clientes.router.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

await inicializar();

const app = express();
app.use(express.json());
app.use(express.static(publicDir));

app.use("/api/clientes", clientesRouter);
app.use("/api/actividades", actividadesRouter);

app.get("/", (_req, res) => {
  res.redirect("/MiniCRM.html");
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`MiniCRM en http://localhost:${PORT}`);
});
