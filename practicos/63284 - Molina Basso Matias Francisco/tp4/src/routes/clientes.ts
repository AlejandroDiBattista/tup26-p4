import { Router } from "express";
import * as controller from "../controllers/clientes.js";

export const clientesRouter = Router();
clientesRouter.route("/").get(controller.listar).post(controller.crear);
clientesRouter
  .route("/:clienteId")
  .get(controller.obtener)
  .put(controller.actualizar)
  .delete(controller.eliminar);
clientesRouter
  .route("/:clienteId/actividades")
  .get(controller.listarActividades)
  .post(controller.agregarActividad);
clientesRouter
  .route("/:clienteId/actividades/:actividadId")
  .get(controller.obtenerActividad)
  .put(controller.editarActividad)
  .delete(controller.eliminarActividad);
clientesRouter.patch(
  "/:clienteId/actividades/:actividadId/completar",
  controller.completarActividad,
);
