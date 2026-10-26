import { Router } from "express";
import {
  actualizarCliente,
  buscarClientes,
  crearActividad,
  crearCliente,
  eliminarCliente,
  listarActividades,
  obtenerCliente,
} from "../controllers/clientes.controller.js";

const router = Router();

router.get("/", buscarClientes);
router.post("/", crearCliente);
router.get("/:id", obtenerCliente);
router.put("/:id", actualizarCliente);
router.delete("/:id", eliminarCliente);

// Actividades asociadas a un cliente
router.get("/:id/actividades", listarActividades);
router.post("/:id/actividades", crearActividad);

export default router;
