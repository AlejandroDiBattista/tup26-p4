import { Router } from "express";
import { actividadesRouter } from "./actividades.js";
import { clientesRouter } from "./clientes.js";

// Router principal de la API, montado en /api.
export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ ok: true });
});

apiRouter.use("/clientes", clientesRouter);
apiRouter.use("/actividades", actividadesRouter);
