import type { Request, Response } from "express";
import { Clientes } from "../services/clientes.service.js";

export class ClientesController {
  static async listar(_request: Request, response: Response): Promise<void> {
    const resultado = await Clientes.listar();
    response.json(resultado);
  }
}
