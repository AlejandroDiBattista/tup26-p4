import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import express, { type NextFunction, type Request, type Response } from "express";
import clientes from "./rutas/clientes.ts";

const app = express();
const aca = dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use("/api/clientes", clientes);
app.use(express.static(resolve(aca, "../public")));
app.get("/", (_req, res) => res.redirect("/MiniCRM.html"));

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const e = err as { status?: number; message?: string };
  res.status(e.status ?? 500).json({ error: e.message ?? "Error interno" });
});

const puerto = Number(process.env.PORT) || 3000;
app.listen(puerto, () => {
  console.log(`MiniCRM en http://localhost:${puerto}`);
});
