import { Router } from "express";
import * as actividades from "../controllers/actividades.controller";

const router = Router();

router.put("/:id", actividades.actualizar);
router.post("/:id/completar", actividades.completar);
router.delete("/:id", actividades.eliminar);

export default router;
