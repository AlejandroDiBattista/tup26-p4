import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";
import "./db/index.js";
import { clientesRouter } from "./routes/clientes.js";
import { ErrorServicio } from "./services/error.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const publicDir = fileURLToPath(new URL("../public/", import.meta.url));

app.use(express.json());
app.use(express.static(publicDir));
app.get("/", (_req, res) => res.sendFile(path.join(publicDir, "microcrm.html")));
app.use("/api/clientes", clientesRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ErrorServicio) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error && typeof error === "object" && "code" in error && error.code === "SQLITE_CONSTRAINT_UNIQUE") {
    res.status(409).json({ error: "Ya existe un cliente con ese email." });
    return;
  }

  if (error && typeof error === "object" && "status" in error && error.status === 400) {
    res.status(400).json({ error: "JSON inválido." });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Error interno del servidor." });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
