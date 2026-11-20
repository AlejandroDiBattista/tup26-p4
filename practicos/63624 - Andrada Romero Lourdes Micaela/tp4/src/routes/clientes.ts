import { Router } from "express";
import { ClientesController as c } from "../controllers/clientes.ts";

export const clientesRouter = Router();

clientesRouter.get("/", c.listar);
clientesRouter.post("/", c.crear);
clientesRouter.get("/:id", c.obtener);
clientesRouter.put("/:id", c.actualizar);
clientesRouter.delete("/:id", c.eliminar);
clientesRouter.post("/:id/actividades", c.agregarActividad);
