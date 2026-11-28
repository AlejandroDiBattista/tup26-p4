import type { Request, Response } from "express";
import { Clientes } from "../services/clientes";
import { HttpError } from "../errores";

/** Convierte el :id de la URL en número o responde 400. */
export function leerId(valor: unknown): number {
  const id = Number(valor);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new HttpError(400, "El id debe ser un número entero positivo");
  }
  return id;
}

// El controlador solo traduce HTTP ↔ servicio. Las reglas están en Clientes.
export class ClientesController {
  static listar(req: Request, res: Response) {
    const texto = typeof req.query.q === "string" ? req.query.q : "";
    res.json(Clientes.listar(texto));
  }

  static obtener(req: Request, res: Response) {
    res.json(Clientes.obtener(leerId(req.params.id)));
  }

  static crear(req: Request, res: Response) {
    res.status(201).json(Clientes.crear(req.body));
  }

  static actualizar(req: Request, res: Response) {
    res.json(Clientes.actualizar(leerId(req.params.id), req.body));
  }

  static eliminar(req: Request, res: Response) {
    Clientes.eliminar(leerId(req.params.id));
    res.status(204).end();
  }

  static agregarActividad(req: Request, res: Response) {
    res.status(201).json(Clientes.agregarActividad(leerId(req.params.id), req.body));
  }
}
