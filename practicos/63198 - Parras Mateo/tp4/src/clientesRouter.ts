import { Router } from "express";
import {
    listar,
    obtener,
    crear,
    actualizar,
    eliminar,
    agregarActividad,
    editarActividad,
    completarActividad,
    eliminarActividad,
} from "./clientesControlador.js";

export const clientesRouter = Router();

clientesRouter.get("/clientes", listar);
clientesRouter.get("/clientes/:id", obtener);
clientesRouter.post("/clientes", crear);
clientesRouter.put("/clientes/:id", actualizar);
clientesRouter.delete("/clientes/:id", eliminar);

clientesRouter.post("/clientes/:id/actividades", agregarActividad);
clientesRouter.put("/actividades/:id", editarActividad);
clientesRouter.patch("/actividades/:id/completar", completarActividad);
clientesRouter.delete("/actividades/:id", eliminarActividad);