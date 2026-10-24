import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (_request, response) => {
  response.send("MiniCRM funcionando correctamente");
});

app.listen(PORT, () => {
  console.log(`Servidor disponible en http://localhost:${PORT}`);
});