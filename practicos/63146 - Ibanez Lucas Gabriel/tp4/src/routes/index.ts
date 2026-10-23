import { Router } from "express";

// Router principal de la API. Aquí se montarán los routers de clientes y actividades.
export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ ok: true });
});
