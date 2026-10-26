// Importamos Router de Express
import { Router } from "express";

// Importamos los controladores para las acciones sobre actividades
import {
  actualizarActividad,
  completarActividad,
  eliminarActividad,
} from "../controllers/actividades.controller.js";

// Creamos la instancia del router de Express
const router = Router();

// PUT /api/actividades/:id -> Actualiza la descripción o fecha de una actividad pendiente
router.put("/actividades/:id", actualizarActividad);

// POST o PATCH /api/actividades/:id/completar -> Marca la actividad como completada
router.post("/actividades/:id/completar", completarActividad);
router.patch("/actividades/:id/completar", completarActividad);

// DELETE /api/actividades/:id -> Elimina una actividad siempre que esté pendiente
router.delete("/actividades/:id", eliminarActividad);

// Exportamos el router para montarlo en la app principal
export default router;
