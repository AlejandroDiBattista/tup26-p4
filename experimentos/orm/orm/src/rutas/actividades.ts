import { Router } from "express";
import * as actividades from "../controladores/actividades.js";

export const rutasActividades = Router({ mergeParams: true });

rutasActividades.get("/", actividades.listar);
rutasActividades.post("/", actividades.crear);
rutasActividades.get("/:actividadId", actividades.obtener);
rutasActividades.patch("/:actividadId", actividades.actualizar);
rutasActividades.patch("/:actividadId/completar", actividades.completar);
rutasActividades.delete("/:actividadId", actividades.eliminar);
