import { Router } from "express";
import * as clientes from "../controllers/clientes.js";

export const api = Router();

api.get("/clientes", clientes.listar);
api.post("/clientes", clientes.crear);
api.get("/clientes/:id", clientes.obtener);
api.put("/clientes/:id", clientes.actualizar);
api.delete("/clientes/:id", clientes.eliminar);
api.post("/clientes/:id/actividades", clientes.agregarActividad);
api.put("/actividades/:actividadId", clientes.actualizarActividad);
api.patch("/actividades/:actividadId/completar", clientes.completarActividad);
api.delete("/actividades/:actividadId", clientes.eliminarActividad);
