import express from "express";
import clientesRouter from "./routes/clientes.routes.js";

const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {res.send("Bienvenido a MiniCRM");});
app.use("/api/clientes", clientesRouter);

app.listen(PORT, () => {console.log(`MiniCRM funcionando en htpp://localhost:${PORT}`);});

