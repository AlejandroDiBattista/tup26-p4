import { Router } from "express";
import {
  getClientes,
  getClientePorId,
  createCliente,
  updateCliente,
  deleteCliente
} from "../controllers/clientesController.js";
import {
  getActividadesPorCliente,
  createActividad
} from "../controllers/actividadesController.js";

export const clientesRouter = Router();

// CRUD Clientes
clientesRouter.get("/", getClientes);
clientesRouter.get("/:id", getClientePorId);
clientesRouter.post("/", createCliente);
clientesRouter.put("/:id", updateCliente);
clientesRouter.delete("/:id", deleteCliente);

// Actividades asociadas a un cliente
clientesRouter.get("/:id/actividades", getActividadesPorCliente);
clientesRouter.post("/:id/actividades", createActividad);

