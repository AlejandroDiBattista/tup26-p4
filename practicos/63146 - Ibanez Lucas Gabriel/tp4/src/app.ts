import express from "express";
import { fileURLToPath } from "node:url";
import { manejarErrores, rutaNoEncontrada } from "./middlewares/errores.js";
import { apiRouter } from "./routes/index.js";

const publicDir = fileURLToPath(new URL("../public", import.meta.url));

export const app = express();

app.use(express.json());
app.use("/api", apiRouter);
app.use("/api", rutaNoEncontrada);
app.use(express.static(publicDir, { index: "MiniCRM.html" }));
app.use(manejarErrores);
