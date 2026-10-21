import { Router } from "express";
import { clientesController as c } from "../controllers/clientes.controller.js";

export const clientesRouter = Router();

clientesRouter.get("/", c.listar);
clientesRouter.post("/", c.crear);
clientesRouter.get("/:id", c.obtener);
clientesRouter.put("/:id", c.actualizar);
clientesRouter.delete("/:id", c.eliminar);

clientesRouter.post("/:id/actividades", c.agregarActividad);
clientesRouter.put("/:id/actividades/:actividadId", c.actualizarActividad);
clientesRouter.patch("/:id/actividades/:actividadId", c.completarActividad);
clientesRouter.delete("/:id/actividades/:actividadId", c.eliminarActividad);
