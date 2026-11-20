// Controladores HTTP de clientes: traducen request/response y delegan en el servicio.
// Express 5 envía al manejador de errores cualquier excepción de un handler async.
import type { Request, Response } from "express";
import { Clientes } from "../services/ClientesService.js";
import { cuerpo, idDe } from "./parametros.js";

export const clientesController = {
  async listar(req: Request, res: Response) {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    res.json(await Clientes.obtenerTodos(q));
  },

  async obtener(req: Request, res: Response) {
    res.json(await Clientes.obtenerPorId(idDe(req.params.id)));
  },

  async crear(req: Request, res: Response) {
    res.status(201).json(await Clientes.crear(cuerpo(req.body)));
  },

  async actualizar(req: Request, res: Response) {
    res.json(await Clientes.actualizar(idDe(req.params.id), cuerpo(req.body)));
  },

  async eliminar(req: Request, res: Response) {
    await Clientes.eliminar(idDe(req.params.id));
    res.status(204).end();
  },

  async agregarActividad(req: Request, res: Response) {
    const clienteId = idDe(req.params.clienteId, "clienteId");
    res.status(201).json(await Clientes.agregarActividad(clienteId, cuerpo(req.body)));
  },
};
