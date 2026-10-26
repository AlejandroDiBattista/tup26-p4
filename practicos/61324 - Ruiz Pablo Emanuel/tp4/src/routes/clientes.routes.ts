import { Router } from "express";
import { listarClientes } from "../controllers/clientes.controller.js";

const clientesRouter = Router();

clientesRouter.get("/", listarClientes);


export default clientesRouter;