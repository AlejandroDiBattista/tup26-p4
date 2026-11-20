import { Router } from "express";
import { actividadesRouter } from "./actividades.routes.js";
import { clientesController as c } from "./clientes.controller.js";

export const clientesRouter = Router();

clientesRouter.get("/", c.listar);
clientesRouter.post("/", c.crear);
clientesRouter.get("/:clienteId", c.obtener);
clientesRouter.put("/:clienteId", c.actualizar);
clientesRouter.patch("/:clienteId", c.actualizar);
clientesRouter.delete("/:clienteId", c.eliminar);
clientesRouter.use("/:clienteId/actividades", actividadesRouter);
