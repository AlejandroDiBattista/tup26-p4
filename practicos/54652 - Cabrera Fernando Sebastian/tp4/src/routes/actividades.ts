import { Router } from "express";
import { ActividadesController } from "../controllers/actividades";

const router = Router();

router.put("/:id", ActividadesController.editar);
router.post("/:id/completar", ActividadesController.completar);
router.delete("/:id", ActividadesController.eliminar);

export default router;
