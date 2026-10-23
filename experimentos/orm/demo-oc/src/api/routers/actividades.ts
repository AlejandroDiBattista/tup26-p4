import { Router } from "express";
import * as controlador from "../controladores/actividades.js";

/**
 * Actividades de un cliente. `mergeParams` permite leer `:clienteId`
 * del router padre: acá no hay acceso a actividades sueltas.
 */
export const actividadesRouter = Router({ mergeParams: true });

actividadesRouter.get("/", controlador.listar);
actividadesRouter.post("/", controlador.crear);
actividadesRouter.get("/:actividadId", controlador.obtener);
actividadesRouter.patch("/:actividadId", controlador.actualizar);
actividadesRouter.put("/:actividadId", controlador.actualizar);
actividadesRouter.delete("/:actividadId", controlador.eliminar);
actividadesRouter.post("/:actividadId/completar", controlador.completar);
