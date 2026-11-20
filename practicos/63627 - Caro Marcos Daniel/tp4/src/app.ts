import express from "express";
import { errorHandler } from "./middleware/error-handler.js";
import { clientesRouter } from "./routes/clientes.routes.js";

export const app = express();

app.use(express.json());
app.use("/api/clientes", clientesRouter);
app.use(errorHandler);
