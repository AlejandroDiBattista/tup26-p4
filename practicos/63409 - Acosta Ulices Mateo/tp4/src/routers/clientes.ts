import { Router } from "express";
import * as clientes from "../controllers/clientes.js";
import { actividadesRouter } from "./actividades.js";

export const clientesRouter = Router();

clientesRouter.get("/", clientes.listar);
clientesRouter.get("/:id", clientes.obtener);
clientesRouter.post("/", clientes.crear);
clientesRouter.patch("/:id", clientes.actualizar);
clientesRouter.delete("/:id", clientes.borrar);

clientesRouter.use("/:clienteId/actividades", actividadesRouter);
