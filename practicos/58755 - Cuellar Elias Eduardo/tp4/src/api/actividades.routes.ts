import { Router } from "express";
import { actividadesController as c } from "./actividades.controller.js";

// mergeParams: expone :clienteId, definido en el router padre.
export const actividadesRouter = Router({ mergeParams: true });

actividadesRouter.get("/", c.listar);
actividadesRouter.post("/", c.crear);
actividadesRouter.get("/:id", c.obtener);
actividadesRouter.put("/:id", c.actualizar);
actividadesRouter.patch("/:id", c.actualizar);
actividadesRouter.delete("/:id", c.eliminar);
actividadesRouter.post("/:id/completar", c.completar);
