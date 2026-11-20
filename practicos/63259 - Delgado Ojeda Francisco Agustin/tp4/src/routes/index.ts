import { Router } from "express";
import { clientesRouter } from "./clientes.routes.js";

export const apiRouter = Router();

apiRouter.use("/clientes", clientesRouter);
