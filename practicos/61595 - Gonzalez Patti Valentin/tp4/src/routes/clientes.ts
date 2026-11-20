import { Router } from "express";
import {
  actualizarActividad,
  actualizarCliente,
  completarActividad,
  crearActividad,
  crearCliente,
  eliminarActividad,
  eliminarCliente,
  listarActividades,
  listarClientes,
  obtenerActividad,
  obtenerCliente,
} from "../controllers/clientes.js";

export const clientesRouter = Router();

clientesRouter.get("/", listarClientes);
clientesRouter.post("/", crearCliente);
clientesRouter.get("/:clienteId", obtenerCliente);
clientesRouter.put("/:clienteId", actualizarCliente);
clientesRouter.patch("/:clienteId", actualizarCliente);
clientesRouter.delete("/:clienteId", eliminarCliente);

clientesRouter.get("/:clienteId/actividades", listarActividades);
clientesRouter.post("/:clienteId/actividades", crearActividad);
clientesRouter.get("/:clienteId/actividades/:actividadId", obtenerActividad);
clientesRouter.put("/:clienteId/actividades/:actividadId", actualizarActividad);
clientesRouter.patch("/:clienteId/actividades/:actividadId", actualizarActividad);
clientesRouter.delete("/:clienteId/actividades/:actividadId", eliminarActividad);
clientesRouter.post("/:clienteId/actividades/:actividadId/completar", completarActividad);
