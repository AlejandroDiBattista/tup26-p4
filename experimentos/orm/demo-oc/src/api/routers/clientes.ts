import { Router } from "express";
import * as controlador from "../controladores/clientes.js";
import { actividadesRouter } from "./actividades.js";

export const clientesRouter = Router();

clientesRouter.get("/", controlador.listar);
clientesRouter.post("/", controlador.crear);
clientesRouter.get("/:clienteId", controlador.obtener);
clientesRouter.patch("/:clienteId", controlador.actualizar);
clientesRouter.put("/:clienteId", controlador.actualizar);
clientesRouter.delete("/:clienteId", controlador.eliminar);

// Composición: las actividades solo se publican dentro de su cliente.
clientesRouter.use("/:clienteId/actividades", actividadesRouter);
