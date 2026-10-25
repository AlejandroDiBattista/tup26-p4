import { Router } from "express";

export const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
