import { Router } from "express";
import * as controlador from "../controllers/actividades.controller";

const router = Router();

router.put("/:id", controlador.actualizar);
router.patch("/:id/completar", controlador.completar);
router.delete("/:id", controlador.eliminar);

export default router;
