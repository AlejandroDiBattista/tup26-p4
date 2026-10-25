import { Router } from "express";
import { ClientesController } from "../controllers/clientes.controller.js";

export const clientesRouter = Router();

clientesRouter.get("/", ClientesController.listar);
