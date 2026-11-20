import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { actividadesRouter } from "./routes/actividades.routes.js";
import { clientesRouter } from "./routes/clientes.routes.js";
import { ErrorServicio } from "./services/ErrorServicio.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.get("/", (_request, response) => {
  response.send("MiniCRM funcionando correctamente");
});

app.use("/api/clientes", clientesRouter);
app.use("/api/actividades", actividadesRouter);

app.use((_request, response) => {
  response.status(404).json({
    error: "Ruta no encontrada",
  });
});

app.use(
  (
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    if (error instanceof ErrorServicio) {
      response.status(error.estado).json({
        error: error.message,
      });
      return;
    }

    console.error(error);

    response.status(500).json({
      error: "Error interno del servidor",
    });
  },
);

app.listen(PORT, () => {
  console.log(`Servidor disponible en http://localhost:${PORT}`);
});