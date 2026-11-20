import express from "express";
import path from "node:path";
import { manejarErrores, rutaNoEncontrada } from "./middlewares/errores";
import { apiRouter } from "./routes";

export const app = express();

app.use(express.json());
app.use(express.static(path.join(import.meta.dirname, "..", "public")));

app.use("/api", apiRouter);
app.use("/api", rutaNoEncontrada);

app.use(manejarErrores);
