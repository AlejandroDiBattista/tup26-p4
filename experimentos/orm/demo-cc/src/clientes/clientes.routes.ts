import { Router } from "express";
import { actividadesRouter } from "../actividades/actividades.routes.js";
import * as c from "./clientes.controller.js";

export const clientesRouter = Router();

clientesRouter.route("/").get(c.listar).post(c.crear);
clientesRouter.route("/:id").get(c.obtener).patch(c.actualizar).delete(c.eliminar);
clientesRouter.use("/:clienteId/actividades", actividadesRouter);
