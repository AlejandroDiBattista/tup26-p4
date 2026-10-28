import express from "express";
import "./db/index.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
