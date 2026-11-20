import { Router } from "express";
import { actualizarActividad, actualizarCliente, completarActividad, crearActividad, crearCliente, eliminarActividad, eliminarCliente, listarClientes, obtenerCliente } from "../controllers/clientes.controller.js";

export const clientesRouter = Router();
clientesRouter.get("/", listarClientes);
clientesRouter.post("/", crearCliente);
clientesRouter.get("/:id", obtenerCliente);
clientesRouter.put("/:id", actualizarCliente);
clientesRouter.delete("/:id", eliminarCliente);
clientesRouter.post("/:id/actividades", crearActividad);
clientesRouter.put("/:id/actividades/:actividadId", actualizarActividad);
clientesRouter.patch("/:id/actividades/:actividadId/completar", completarActividad);
clientesRouter.delete("/:id/actividades/:actividadId", eliminarActividad);
