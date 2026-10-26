import { Router } from "express";
import {
  actualizarCliente, crearCliente, eliminarCliente, listarActividadesCliente,
  listarClientes, obtenerCliente
} from "../controllers/clientesController";

const router = Router();

router.get("/", listarClientes);
router.post("/", crearCliente);
router.get("/:id", obtenerCliente);
router.put("/:id", actualizarCliente);
router.delete("/:id", eliminarCliente);
router.get("/:id/actividades", listarActividadesCliente);

export default router;
