import express, { type ErrorRequestHandler } from "express";
import { fileURLToPath } from "node:url";
import { ErrorHttp } from "./http/errores.js";
import { rutasClientes } from "./rutas/clientes.js";

export const app = express();

const carpetaPublica = fileURLToPath(new URL("../public", import.meta.url));

app.use(express.json());
app.use(express.static(carpetaPublica));
app.get("/", (_request, response) => response.redirect("/clientes.html"));
app.use("/api/clientes", rutasClientes);

app.use((_request, response) => {
  response.status(404).json({ error: { mensaje: "No se encontró la ruta solicitada." } });
});

const manejarError: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof ErrorHttp) {
    response.status(error.estado).json({ error: { mensaje: error.message } });
    return;
  }

  const mensajes: string[] = [];
  let actual: unknown = error;
  while (actual && typeof actual === "object") {
    const detalle = actual as { message?: unknown; cause?: unknown };
    if (typeof detalle.message === "string") mensajes.push(detalle.message);
    actual = detalle.cause;
  }
  const mensaje = mensajes.join(" ");
  const estadoParseo = (error as { status?: number } | null)?.status;
  if (estadoParseo === 400) {
    response.status(400).json({ error: { mensaje: "El JSON enviado no es válido." } });
    return;
  }
  if (mensaje.includes("teléfono no es un número argentino válido")) {
    response.status(400).json({ error: { mensaje } });
    return;
  }
  if (mensaje.includes("UNIQUE constraint failed: clientes.email")) {
    response.status(409).json({ error: { mensaje: "Ya existe un cliente con ese email." } });
    return;
  }

  console.error(error);
  response.status(500).json({
    error: { mensaje: "Ocurrió un error interno al procesar la solicitud." }
  });
};

app.use(manejarError);
