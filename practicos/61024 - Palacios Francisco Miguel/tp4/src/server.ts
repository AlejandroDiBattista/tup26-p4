import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { clientesRouter } from "./routes/clientes.routes.js";

const app = express();
const puerto = Number(process.env.PORT ?? 3000);
const directorio = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.resolve(directorio, "../public")));
app.use("/api/clientes", clientesRouter);
app.get("/api", (_req, res) => res.json({ mensaje: "API MiniCRM", clientes: "/api/clientes" }));
app.get("/", (_req, res) => res.redirect("/MiniCRM.html"));

app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof SyntaxError && "status" in error && error.status === 400) {
    res.status(400).json({ error: "El cuerpo JSON no es valido" });
  } else {
    next(error);
  }
});

app.listen(puerto, () => console.log(`MiniCRM disponible en http://localhost:${puerto}`));
