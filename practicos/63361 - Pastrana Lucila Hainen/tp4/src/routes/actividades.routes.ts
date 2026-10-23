import { Router } from "express";
import * as actividades from "../controllers/actividades.controller";

// Subrecurso: se monta en /api/clientes/:clienteId/actividades
export const actividadesRouter = Router({ mergeParams: true });

actividadesRouter.get("/", actividades.listar);
actividadesRouter.post("/", actividades.crear);
actividadesRouter.put("/:actividadId", actividades.actualizar);
actividadesRouter.patch("/:actividadId/completar", actividades.completar);
actividadesRouter.delete("/:actividadId", actividades.eliminar);
