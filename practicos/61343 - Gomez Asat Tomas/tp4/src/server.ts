import express from "express";
import { clientesRouter } from "./routes/clientes.routes";
const app = express();
app.use(express.json());
app.use(express.static("public")); 
app.use("/api", clientesRouter);
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});