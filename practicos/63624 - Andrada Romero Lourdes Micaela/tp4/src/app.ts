import express from "express";
import path from "node:path";
import { clientesRouter } from "./routes/clientes.ts";
import { actividadesRouter } from "./routes/actividades.ts";
import { manejarErrores, rutaNoEncontrada } from "./middlewares/errores.ts";

const carpetaPublica = path.join(import.meta.dirname, "..", "public");

export const app = express();

app.use(express.json());
app.use(express.static(carpetaPublica));
app.get("/", (_req, res) => res.redirect("/MiniCRM.html"));

app.use("/api/clientes", clientesRouter);
app.use("/api/actividades", actividadesRouter);
app.use("/api", rutaNoEncontrada);

app.use(manejarErrores);
