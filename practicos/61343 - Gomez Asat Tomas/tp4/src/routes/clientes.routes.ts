import { Router } from "express";
import { ClientesController } from "../controllers/clientes.controller";

export const clientesRouter = Router();
// clientes
clientesRouter.get("/clientes", ClientesController.listar);
clientesRouter.get("/clientes/:id", ClientesController.obtenerPorId);
clientesRouter.post("/clientes", ClientesController.crear);
clientesRouter.put("/clientes/:id", ClientesController.editar);
clientesRouter.delete("/clientes/:id", ClientesController.eliminar);

// actividades asociadas a un cliente
clientesRouter.post("/clientes/:id/actividades", ClientesController.crearActividad);

// actividades acceso directo mediante id de actividad
clientesRouter.put("/actividades/:id", ClientesController.editarActividad);
clientesRouter.delete("/actividades/:id", ClientesController.eliminarActividad);
clientesRouter.patch("/actividades/:id/completar", ClientesController.marcarCompletada);