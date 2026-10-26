import { Router } from "express";
import * as actividades from "../controllers/actividades.js";

// mergeParams: permite leer :clienteId, que está definido en el router de clientes.
export const actividadesRouter = Router({ mergeParams: true });

actividadesRouter.get("/", actividades.listar);
actividadesRouter.post("/", actividades.crear);
actividadesRouter.patch("/:id", actividades.actualizar);
actividadesRouter.post("/:id/completar", actividades.completar);
actividadesRouter.delete("/:id", actividades.borrar);
