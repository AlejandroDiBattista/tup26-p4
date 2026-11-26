import { Router } from "express";
import actividadesRouter from "./actividades.routes";
import clientesRouter from "./clientes.routes";

const router = Router();

router.use("/clientes", clientesRouter);
router.use("/actividades", actividadesRouter);

export default router;
