import { Router } from "express";
import { actualizarCliente, crearCliente, eliminarCliente, listarClientes, obtenerCliente } from "../controllers/clientesController.js";
import { crearActividad, listarActividades } from "../controllers/actividadesController.js";

const router = Router();

router.get("/", listarClientes);
router.get("/:id", obtenerCliente);
router.post("/", crearCliente);
router.put("/:id", actualizarCliente);
router.delete("/:id", eliminarCliente);

router.get("/:clienteId/actividades", listarActividades);
router.post("/:clienteId/actividades", crearActividad);

export default router;