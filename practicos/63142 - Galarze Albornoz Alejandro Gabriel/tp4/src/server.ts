import express from "express";
import path from "node:path";
import "./db/client.js";
import { api } from "./routes/api.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const root = process.cwd();

app.use(express.json());
app.use(express.static(path.join(root, "public")));
app.use("/api", api);
app.get("/", (_req, res) => res.sendFile(path.join(root, "public", "MiniCRM.html")));
app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: "Ocurrió un error en el servidor" });
});

app.listen(port, () => console.log(`MiniCRM funcionando en http://localhost:${port}`));
