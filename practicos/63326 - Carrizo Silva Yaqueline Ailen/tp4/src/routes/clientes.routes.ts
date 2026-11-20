import { Router } from "express";
import {
  crearCliente,
  editarCliente,
  eliminarCliente,
  listarClientes,
  obtenerCliente,
} from "../controllers/clientes.controller.js";
import {
  crearActividad,
  listarActividades,
} from "../controllers/actividades.controller.js";

export const clientesRouter = Router();

clientesRouter.get("/", listarClientes);
clientesRouter.get("/:id", obtenerCliente);
clientesRouter.post("/", crearCliente);
clientesRouter.put("/:id", editarCliente);
clientesRouter.delete("/:id", eliminarCliente);

clientesRouter.get("/:clienteId/actividades", listarActividades);
clientesRouter.post("/:clienteId/actividades", crearActividad);