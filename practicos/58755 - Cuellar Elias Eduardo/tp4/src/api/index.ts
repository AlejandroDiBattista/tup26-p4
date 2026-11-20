import { Router } from "express";
import { clientesRouter } from "./clientes.routes.js";
import { rutaNoEncontrada } from "./errores.js";

export const apiRouter = Router();

apiRouter.use("/clientes", clientesRouter);
// Cualquier otra ruta bajo /api responde 404 en JSON (y no cae en los archivos estáticos).
apiRouter.use(rutaNoEncontrada);
