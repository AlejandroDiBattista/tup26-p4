import { Router } from "express";
import {
  actualizarActividad, actualizarCliente, completarActividad, crearActividad,
  crearCliente, eliminarActividad, eliminarCliente, listarActividades,
  listarClientes, obtenerCliente,
} from "../controllers/clientesController.js";

export const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
router.get("/clientes", listarClientes);
router.post("/clientes", crearCliente);
router.get("/clientes/:id", obtenerCliente);
router.patch("/clientes/:id", actualizarCliente);
router.put("/clientes/:id", actualizarCliente);
router.delete("/clientes/:id", eliminarCliente);
router.get("/clientes/:id/actividades", listarActividades);
router.post("/clientes/:id/actividades", crearActividad);
router.patch("/actividades/:id", actualizarActividad);
router.put("/actividades/:id", actualizarActividad);
router.patch("/actividades/:id/completar", completarActividad);
router.delete("/actividades/:id", eliminarActividad);
