import { Router } from "express";

import * as c from "../controladores/clientes.js";

export const rutasClientes = Router();

rutasClientes.get("/", c.listar);
rutasClientes.post("/", c.crear);
rutasClientes.get("/:id", c.obtener);
rutasClientes.patch("/:id", c.actualizar);
rutasClientes.delete("/:id", c.eliminar);
rutasClientes.get("/:id/actividades", c.listarActividades);
rutasClientes.post("/:id/actividades", c.crearActividad);
