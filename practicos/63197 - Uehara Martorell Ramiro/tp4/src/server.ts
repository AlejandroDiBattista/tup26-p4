import { join } from "node:path";
import express, { type NextFunction, type Request, type Response } from "express";
import { sembrarSiVacio } from "./db/seed";
import actividadesRouter from "./routes/actividades.routes";
import clientesRouter from "./routes/clientes.routes";

const app = express();

app.use(express.json());
app.use(express.static(join(import.meta.dirname, "../public")));
app.get("/", (_req, res) => res.redirect("/MiniCRM.html"));

app.use("/api/clientes", clientesRouter);
app.use("/api/actividades", actividadesRouter);

// Los errores de negocio (y los de JSON mal formado) traen su propio status.
app.use((error: { status?: number; message?: string }, _req: Request, res: Response, _next: NextFunction) => {
  const status = typeof error.status === "number" ? error.status : 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ error: status < 500 ? error.message : "Error interno del servidor" });
});

sembrarSiVacio();

const PUERTO = Number(process.env.PORT ?? 3000);
app.listen(PUERTO, () => console.log(`MiniCRM en http://localhost:${PUERTO}`));
