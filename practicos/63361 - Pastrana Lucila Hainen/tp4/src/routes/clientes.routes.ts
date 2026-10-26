import { Router } from "express";
import * as clientes from "../controllers/clientes.controller";
import { actividadesRouter } from "./actividades.routes";

export const clientesRouter = Router();

clientesRouter.get("/", clientes.listar);
clientesRouter.post("/", clientes.crear);
clientesRouter.get("/:id", clientes.obtener);
clientesRouter.put("/:id", clientes.actualizar);
clientesRouter.delete("/:id", clientes.eliminar);

clientesRouter.use("/:clienteId/actividades", actividadesRouter);
