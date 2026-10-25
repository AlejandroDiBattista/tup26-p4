import { Router } from "express";
import {
  actualizarActividad,
  completarActividad,
  eliminarActividad,
} from "../controllers/actividades.controller.js";

const router = Router();

router.put("/actividades/:id", actualizarActividad);
router.post("/actividades/:id/completar", completarActividad);
router.patch("/actividades/:id/completar", completarActividad);
router.delete("/actividades/:id", eliminarActividad);

export default router;
