const express = require("express");
const path = require("node:path");

const app = express();

app.use(express.json({ limit: "100kb" }));
app.get("/", (_request, response) => {
  response.sendFile(path.join(__dirname, "..", "public", "MiniCRM.html"));
});
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api/clientes", require("./rutas/clientesRoutes"));
app.use("/api/actividades", require("./rutas/actividadesRoutes"));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use((request, response) => {
  response.status(404).json({ error: "Recurso no encontrado." });
});

app.use((error, _request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }

  if (error.type === "entity.parse.failed") {
    return response
      .status(400)
      .json({ error: "El JSON de la solicitud no es válido." });
  }
  if (error.type === "entity.too.large") {
    return response
      .status(413)
      .json({ error: "El cuerpo de la solicitud supera el tamaño permitido." });
  }

  const status = Number.isInteger(error.estado) ? error.estado : 500;
  if (status >= 500) {
    console.error(error);
  }

  response.status(status).json({
    error: status === 500 ? "Ocurrió un error interno." : error.message,
  });
});

module.exports = app;
