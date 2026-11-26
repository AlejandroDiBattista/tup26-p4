import { Router } from "express";
import * as controlador from "../controllers/clientes.controller";

const router = Router();

router.get("/", controlador.listar);
router.get("/:id", controlador.obtener);
router.post("/", controlador.crear);
router.put("/:id", controlador.actualizar);
router.delete("/:id", controlador.eliminar);
router.get("/:id/actividades", controlador.listarActividades);
router.post("/:id/actividades", controlador.crearActividad);

export default router;
