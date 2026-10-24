import express from "express";
import path from "path";
import clientesRouter from "./routes/clientes";
import actividadesRouter from "./routes/actividades";
import "./db";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/MiniCRM.html"));
});

app.use("/api/clientes", clientesRouter);
app.use("/api/actividades", actividadesRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
