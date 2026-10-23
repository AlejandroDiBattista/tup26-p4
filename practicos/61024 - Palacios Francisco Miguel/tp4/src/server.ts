import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { clientesRouter } from "./routes/clientes.routes.js";

const app = express();
const puerto = Number(process.env.PORT ?? 3000);
const directorio = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(path.resolve(directorio, "../public")));
app.use("/api/clientes", clientesRouter);
app.get("/api", (_req, res) => res.json({ mensaje: "API MiniCRM", clientes: "/api/clientes" }));

app.listen(puerto, () => console.log(`MiniCRM disponible en http://localhost:${puerto}`));
