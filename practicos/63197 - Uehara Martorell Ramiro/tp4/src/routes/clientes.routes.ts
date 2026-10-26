import { Router } from "express";
import * as clientes from "../controllers/clientes.controller";

const router = Router();

router.get("/", clientes.listar);
router.get("/:id", clientes.obtener);
router.post("/", clientes.crear);
router.put("/:id", clientes.actualizar);
router.delete("/:id", clientes.eliminar);
router.post("/:id/actividades", clientes.agregarActividad);

export default router;
