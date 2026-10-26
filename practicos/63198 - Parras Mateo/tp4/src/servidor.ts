import express from "express";
import { clientesRouter } from "./clientesRouter.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use("/api", clientesRouter);

const puerto = 3000;
app.listen(puerto, () => {
    console.log(`Servidor andando en http://localhost:${puerto}`);
});