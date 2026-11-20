import { Router } from "express";
import * as actividades from "../controladores/actividades.ts";
import * as clientes from "../controladores/clientes.ts";

const router = Router();

router.route("/")
  .get(clientes.listar)
  .post(clientes.crear);

router.route("/:id")
  .get(clientes.obtener)
  .patch(clientes.actualizar)
  .delete(clientes.eliminar);

router.post("/:id/actividades", actividades.crear);
router.patch("/:id/actividades/:actId", actividades.actualizar);
router.post("/:id/actividades/:actId/completar", actividades.completar);
router.delete("/:id/actividades/:actId", actividades.eliminar);

export default router;
