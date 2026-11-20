import { Router } from "express";
import { actividadesController as c } from "../controllers/actividadesController.js";

export const actividadesRouter = Router();

actividadesRouter.put("/:actividadId", c.actualizar);
actividadesRouter.delete("/:actividadId", c.eliminar);
actividadesRouter.patch("/:actividadId/completar", c.completar);
