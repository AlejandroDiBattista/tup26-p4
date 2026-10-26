import { Router } from "express";
import {
  actualizarActividad, completarActividad, crearActividad, eliminarActividad
} from "../controllers/actividadesController";

const router = Router();

router.post("/cliente/:clienteId", crearActividad);
router.put("/:id", actualizarActividad);
router.patch("/:id/completar", completarActividad);
router.delete("/:id", eliminarActividad);

export default router;
