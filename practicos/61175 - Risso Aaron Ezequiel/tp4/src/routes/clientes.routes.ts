import { Router } from "express";
import * as clientesController from "../controllers/clientes.controller.js";

const router = Router();

router.get("/buscar", clientesController.buscar);
router.get("/", clientesController.listar);
router.post("/", clientesController.crear);
router.patch("/:clienteId", clientesController.editar);
router.delete("/:clienteId", clientesController.eliminar);

router.get("/:clienteId/actividades", clientesController.listarActividades);
router.post("/:clienteId/actividades", clientesController.crearActividad);
router.patch(
  "/:clienteId/actividades/:actividadId/completar",
  clientesController.completarActividad,
);
router.patch(
  "/:clienteId/actividades/:actividadId",
  clientesController.editarActividad,
);
router.delete(
  "/:clienteId/actividades/:actividadId",
  clientesController.eliminarActividad,
);

export default router;
