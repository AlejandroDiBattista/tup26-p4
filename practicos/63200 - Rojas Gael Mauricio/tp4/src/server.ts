import "dotenv/config";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import { fileURLToPath } from "node:url";
import { router } from "./routes/clientesRoutes.js";
import { ErrorDeNegocio } from "./services/clientesService.js";
 
const app = express();
app.use(express.json());
app.use(express.static(fileURLToPath(new URL("../public", import.meta.url))));
app.use("/api", router);
 
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status = error instanceof ErrorDeNegocio ? error.statusCode : 500;
  const message = error instanceof Error ? error.message : "Error interno";
  res.status(status).json({ error: message });
});
 
const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => console.log(`MiniCRM en http://localhost:${PORT}/MiniCRM.html`));