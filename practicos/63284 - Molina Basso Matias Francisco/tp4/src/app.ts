import express, { type ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { clientesRouter } from "./routes/clientes.js";
import { ErrorHttp } from "./services/clientes.js";
import { mcpRouter } from "./mcp/router.js";

export const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use("/api/clientes", clientesRouter);
app.use("/mcp", mcpRouter);
app.get("/", (_req, res) => res.redirect("/microcrm.html"));
app.use(express.static("public"));
app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});
const errores: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res
      .status(400)
      .json({
        error: "Revisá los datos ingresados.",
        detalles: error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      });
  } else if (error instanceof ErrorHttp) {
    res.status(error.status).json({ error: error.message });
  } else if (
    error.type === "entity.parse.failed" ||
    error.type === "entity.too.large"
  ) {
    res
      .status(error.status)
      .json({ error: "El cuerpo JSON es inválido o demasiado grande." });
  } else {
    console.error(error);
    res.status(500).json({ error: "No se pudo realizar la operación." });
  }
};
app.use(errores);
