import { Router } from "express";
import { ClientesController } from "../controllers/clientes";

const router = Router();

router.get("/", ClientesController.listar); // ?q=texto busca por cualquier campo
router.get("/:id", ClientesController.obtener);
router.post("/", ClientesController.crear);
router.put("/:id", ClientesController.actualizar);
router.delete("/:id", ClientesController.eliminar);
router.post("/:id/actividades", ClientesController.agregarActividad);

export default router;
