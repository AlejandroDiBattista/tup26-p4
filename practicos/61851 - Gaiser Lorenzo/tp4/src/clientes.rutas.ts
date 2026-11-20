import { Router } from "express";
import { buscar, obtener, crear, eliminar, listarActividades, agregarActividad, completarActividad } from "./clientes.controlador.ts";

const router = Router();

router.get("/", buscar);
router.get("/:id", obtener);
router.get("/:id/actividades", listarActividades);
router.post("/", crear);
router.post("/:id/actividades", agregarActividad);
router.patch("/:id/actividades/:actividadId/completar", completarActividad);
router.delete("/:id", eliminar);

export default router;
