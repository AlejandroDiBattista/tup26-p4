import { Router } from "express";

import * as a from "../controladores/actividades.js";

export const rutasActividades = Router();

rutasActividades.patch("/:id", a.actualizar);
rutasActividades.post("/:id/completar", a.completar);
rutasActividades.delete("/:id", a.eliminar);
