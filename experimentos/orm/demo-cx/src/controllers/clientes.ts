import type { Request, Response } from 'express';
import type { Database } from '../db/connection.js';
import { clientes } from '../db/schema.js';
import { Clientes } from '../clientes.js';
import { cuerpo, filtro, id } from '../http/peticion.js';

export function clientesController(db: Database) {
  return {
    buscar: async (req: Request, res: Response) => {
      res.json(await Clientes.buscar(db, filtro(req.query, clientes)));
    },

    obtener: async (req: Request, res: Response) => {
      res.json(await Clientes.obtener(db, id(req.params.clienteId)));
    },
    
    crear: async (req: Request, res: Response) => {
      const cliente = await Clientes.crear(db, cuerpo(req.body, clientes));
      res.status(201).location(`/api/clientes/${cliente.id}`).json(cliente);
    },
    
    actualizar: async (req: Request, res: Response) => {
      res.json(await Clientes.actualizar(db, id(req.params.clienteId), cuerpo(req.body, clientes, true)));
    },
    
    eliminar: async (req: Request, res: Response) => {
      await Clientes.eliminar(db, id(req.params.clienteId));
      res.status(204).end();
    },
  };
}
