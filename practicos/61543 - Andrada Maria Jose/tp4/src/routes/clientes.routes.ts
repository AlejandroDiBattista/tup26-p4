import { Router } from "express";
import {
  actualizarCliente,
  buscarClientes,
  crearCliente,
  eliminarCliente,
  listarClientes,
  obtenerCliente,
} from "../controllers/clientes.controller.js";

const router = Router();
router.get("/", listarClientes);
router.get("/buscar", buscarClientes);
router.get("/:id", obtenerCliente);
router.post("/", crearCliente);
router.put("/:id", actualizarCliente);
router.delete("/:id", eliminarCliente);
export default router;