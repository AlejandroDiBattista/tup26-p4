import express from "express";
import path from "node:path";
import { clientesRouter } from "./routes/clientesRoutes.js";
import { actividadesRouter } from "./routes/actividadesRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Archivos estáticos de la aplicación web
const publicPath = path.resolve(process.cwd(), "public");
app.use(express.static(publicPath));

// Rutas de API REST
app.use("/api/clientes", clientesRouter);
app.use("/api/actividades", actividadesRouter);

// Redirigir la raíz al archivo requerido por la consigna
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "MiniCRM.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
  console.log(`Aplicación MiniCRM disponible en http://localhost:${PORT}/MiniCRM.html`);
});

