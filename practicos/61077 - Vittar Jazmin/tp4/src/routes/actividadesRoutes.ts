import { Router } from "express";
import { actualizarActividad, completarActividad, eliminarActividad } from "../controllers/actividadesController.js";

const router = Router();

router.put("/:id", actualizarActividad);
router.delete("/:id", eliminarActividad);
router.patch("/:id/completar", completarActividad);

export default router;