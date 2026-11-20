import { Router } from "express";
import { clientesRouter } from "./clientes.routes";

export const apiRouter = Router();

apiRouter.use("/clientes", clientesRouter);
