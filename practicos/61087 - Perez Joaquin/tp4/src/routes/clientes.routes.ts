import { Router } from "express";
import {
  completarActividad,
  crearActividad,
  crearCliente,
  editarActividad,
  editarCliente,
  eliminarActividad,
  eliminarCliente,
  listarClientes,
  obtenerCliente,
} from "../controllers/clientes.controller.js";

export const clientesRouter = Router();

clientesRouter.get("/clientes", listarClientes);
clientesRouter.post("/clientes", crearCliente);
clientesRouter.get("/clientes/:id", obtenerCliente);
clientesRouter.put("/clientes/:id", editarCliente);
clientesRouter.delete("/clientes/:id", eliminarCliente);
clientesRouter.post("/clientes/:id/actividades", crearActividad);
clientesRouter.put("/actividades/:id", editarActividad);
clientesRouter.patch("/actividades/:id/completar", completarActividad);
clientesRouter.delete("/actividades/:id", eliminarActividad);
