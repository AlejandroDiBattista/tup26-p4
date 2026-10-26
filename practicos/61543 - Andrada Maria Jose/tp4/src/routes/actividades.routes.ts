import { Router } from "express";
import {
  actualizarActividad,
  completarActividad,
  crearActividad,
  eliminarActividad,
  listarActividades,
  listarVencidas,
} from "../controllers/actividades.controller.js";

const router = Router();
router.get("/clientes/:clienteId/actividades", listarActividades);
router.post("/clientes/:clienteId/actividades", crearActividad);
router.put("/actividades/:id", actualizarActividad);
router.delete("/actividades/:id", eliminarActividad);
router.patch("/actividades/:id/completar", completarActividad);
router.get("/actividades/vencidas", listarVencidas);
export default router;
