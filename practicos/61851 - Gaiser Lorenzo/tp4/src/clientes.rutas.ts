import { Router } from "express";
import { buscar, obtener, crear, eliminar } from "./clientes.controlador.ts";

const router = Router();

router.get("/", buscar);
router.get("/:id", obtener);
router.post("/", crear);
router.delete("/:id", eliminar);

export default router;
