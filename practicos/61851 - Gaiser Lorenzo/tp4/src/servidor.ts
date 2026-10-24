import express from "express";
import clientesRouter from "./clientes.rutas.ts";

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use("/api/clientes", clientesRouter);

app.listen(3000, () => {
  console.log("Servidor escuchando en http://localhost:3000");
});
