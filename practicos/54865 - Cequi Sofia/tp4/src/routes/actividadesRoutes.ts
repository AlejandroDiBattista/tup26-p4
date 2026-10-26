import { Router } from "express";
import {
  updateActividad,
  completeActividad,
  deleteActividad
} from "../controllers/actividadesController.js";

export const actividadesRouter = Router();

// Modificar, completar o eliminar actividades individuales
actividadesRouter.put("/:actividadId", updateActividad);
actividadesRouter.patch("/:actividadId/completar", completeActividad);
actividadesRouter.delete("/:actividadId", deleteActividad);

