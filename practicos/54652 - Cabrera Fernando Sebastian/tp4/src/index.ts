
import express from "express";
import clientesRoutes from "./routes/clientes";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api/clientes", clientesRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "MiniCRM API funcionando correctamente",
  });
});

app.listen(PORT, () => {
  console.log(`MiniCRM API disponible en http://localhost:${PORT}`);
});
