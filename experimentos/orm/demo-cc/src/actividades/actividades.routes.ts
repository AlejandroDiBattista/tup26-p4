import { Router } from "express";
import * as a from "./actividades.controller.js";

export const actividadesRouter = Router({ mergeParams: true });

actividadesRouter.route("/").get(a.listar).post(a.crear);
actividadesRouter.route("/:id").get(a.obtener).patch(a.actualizar).delete(a.eliminar);
actividadesRouter.post("/:id/completar", a.completar);
