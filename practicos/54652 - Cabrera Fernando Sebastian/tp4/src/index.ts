import express, { type NextFunction, type Request, type Response } from "express";
import clientesRoutes from "./routes/clientes";
import actividadesRoutes from "./routes/actividades";
import { HttpError } from "./errores";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.get("/", (_req, res) => res.redirect("/MiniCRM.html"));
app.use("/api/clientes", clientesRoutes);
app.use("/api/actividades", actividadesRoutes);

// Ruta de API inexistente
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejo de errores en un solo lugar. Tiene 4 parámetros y va al final.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err instanceof SyntaxError) {
    res.status(400).json({ error: "El cuerpo no es un JSON válido" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`MiniCRM en http://localhost:${PORT}`);
});
