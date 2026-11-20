import { Router } from "express";
import { clientesController as c } from "../controllers/clientesController.js";

export const clientesRouter = Router();

clientesRouter.get("/", c.listar);
clientesRouter.get("/:id", c.obtener);
clientesRouter.post("/", c.crear);
clientesRouter.put("/:id", c.actualizar);
clientesRouter.delete("/:id", c.eliminar);
clientesRouter.post("/:clienteId/actividades", c.agregarActividad);
