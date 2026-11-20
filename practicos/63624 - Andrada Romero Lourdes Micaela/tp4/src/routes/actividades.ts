import { Router } from "express";
import { ActividadesController as c } from "../controllers/actividades.ts";

export const actividadesRouter = Router();

actividadesRouter.put("/:id", c.actualizar);
actividadesRouter.post("/:id/completar", c.completar);
actividadesRouter.delete("/:id", c.eliminar);
