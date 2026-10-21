import { Router } from "express";
import { clientesController as c } from "../controllers/clientes.controller.js";

export const clientesRouter = Router();

clientesRouter.get("/", c.listar);
clientesRouter.post("/", c.crear);
clientesRouter.get("/:id", c.obtener);
clientesRouter.put("/:id", c.editar);
clientesRouter.delete("/:id", c.eliminar);

clientesRouter.get("/:id/actividades", c.actividades);
clientesRouter.post("/:id/actividades", c.crearActividad);

export const actividadesRouter = Router();

actividadesRouter.put("/:id", c.editarActividad);
actividadesRouter.patch("/:id/completar", c.completarActividad);
actividadesRouter.delete("/:id", c.eliminarActividad);
