import { Router } from "express";

import { actualizarActividad, completarActividad, eliminarActividad } from "../controllers/actividades.js";

export const rutasActividades = Router();

rutasActividades.patch("/:id", actualizarActividad);
rutasActividades.post("/:id/completar", completarActividad);
rutasActividades.delete("/:id", eliminarActividad);
