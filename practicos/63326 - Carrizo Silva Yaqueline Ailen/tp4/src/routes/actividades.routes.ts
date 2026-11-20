import { Router } from "express";
import {
  completarActividad,
  editarActividad,
  eliminarActividad,
} from "../controllers/actividades.controller.js";

export const actividadesRouter = Router();

actividadesRouter.put("/:id", editarActividad);
actividadesRouter.patch("/:id/completar", completarActividad);
actividadesRouter.delete("/:id", eliminarActividad);