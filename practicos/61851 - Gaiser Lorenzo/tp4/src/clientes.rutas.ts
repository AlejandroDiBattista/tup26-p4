import { Router } from "express";
import { buscar, obtener, crear } from "./clientes.controlador.ts";

const router = Router();

router.get("/", buscar);
router.get("/:id", obtener);
router.post("/", crear);

export default router;
