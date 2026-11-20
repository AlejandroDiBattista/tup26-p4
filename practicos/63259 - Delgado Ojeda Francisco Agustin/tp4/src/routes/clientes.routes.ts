import { Router } from "express";
import { ClientesController } from "../controllers/clientes.controller.js";

export const clientesRouter = Router();

clientesRouter.get("/", ClientesController.listar);
clientesRouter.post("/", ClientesController.crear);
clientesRouter.get("/:id", ClientesController.obtener);
clientesRouter.put("/:id", ClientesController.actualizar);
clientesRouter.delete("/:id", ClientesController.eliminar);

clientesRouter.post("/:id/actividades", ClientesController.agregarActividad);
clientesRouter.put("/:id/actividades/:actividadId", ClientesController.actualizarActividad);
clientesRouter.patch("/:id/actividades/:actividadId/completar", ClientesController.completarActividad);
clientesRouter.delete("/:id/actividades/:actividadId", ClientesController.eliminarActividad);
