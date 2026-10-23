import express from "express";
import clientesRouter from "./routes/clientes.routes.js";
import actividadesRouter from "./routes/actividades.routes.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use("/api/clientes", clientesRouter);
app.use("/api", actividadesRouter);
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});