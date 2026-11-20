import { fileURLToPath } from "node:url";
import express, { type NextFunction, type Request, type Response } from "express";
import { clientesRouter } from "./routers/clientes.js";
import { NoEncontrado, NoPermitido } from "./services/errores.js";

export const app = express();

// Archivos estáticos de public/ (por ejemplo /microcrm.html).
// La ruta es relativa a este archivo, así funciona igual desde src/ y desde dist/.
app.use(express.static(fileURLToPath(new URL("../public", import.meta.url))));

app.use(express.json());
app.use("/api/clientes", clientesRouter);

// "UNIQUE constraint failed: clientes.email" -> "Ya existe un registro con ese email"
function mensajeRestriccion(mensaje: string): string {
  const campo = mensaje.match(/failed: \w+\.(\w+)/)?.[1] ?? "dato";
  if (mensaje.includes("UNIQUE")) return `Ya existe un registro con ese ${campo}`;
  if (mensaje.includes("NOT NULL")) return `Falta el campo obligatorio ${campo}`;
  return "Los datos no son válidos";
}

// Traduce los errores a respuestas HTTP.
app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof NoEncontrado) return res.status(404).json({ error: error.message });
  if (error instanceof NoPermitido) return res.status(409).json({ error: error.message });
  // Datos inválidos: JSON mal formado o restricción de la base (campo obligatorio, email repetido).
  if (error.type === "entity.parse.failed") return res.status(400).json({ error: "JSON inválido" });
  if (error.cause?.code === "SQLITE_CONSTRAINT") {
    return res.status(400).json({ error: mensajeRestriccion(error.cause.message) });
  }
  console.error(error);
  res.status(500).json({ error: "Error interno" });
});
