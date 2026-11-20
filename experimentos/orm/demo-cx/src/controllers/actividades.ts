import type { Request, Response } from 'express';
import type { Database } from '../db/connection.js';
import { actividades } from '../db/schema.js';
import { Clientes } from '../clientes.js';
import { cuerpo, ErrorPeticion, filtro, id } from '../http/peticion.js';

export function actividadesController(db: Database) {
  return {
    buscar: async (req: Request, res: Response) => {
      res.json(await Clientes.buscarActividades(db, id(req.params.clienteId), filtro(req.query, actividades, ['estado'])));
    },
    
    obtener: async (req: Request, res: Response) => {
      res.json(await Clientes.obtenerActividad(db, id(req.params.clienteId), id(req.params.actividadId)));
    },
    
    crear: async (req: Request, res: Response) => {
      const clienteId = id(req.params.clienteId);
      const actividad = await Clientes.crearActividad(db, clienteId, cuerpo(req.body, actividades));
      res.status(201).location(`/api/clientes/${clienteId}/actividades/${actividad.id}`).json(actividad);
    },
    
    actualizar: async (req: Request, res: Response) => {
      res.json(await Clientes.actualizarActividad(db, id(req.params.clienteId), id(req.params.actividadId), cuerpo(req.body, actividades, true)));
    },
    
    eliminar: async (req: Request, res: Response) => {
      await Clientes.eliminarActividad(db, id(req.params.clienteId), id(req.params.actividadId));
      res.status(204).end();
    },
    
    completar: async (req: Request, res: Response) => {
      const datos = cuerpo(req.body ?? {}, actividades, true, ['fechaFinalizacion']);
      if (datos.fechaFinalizacion === null) throw new ErrorPeticion('La fecha de finalización debe ser texto o estar omitida.');
      res.json(await Clientes.completarActividad(db, id(req.params.clienteId), id(req.params.actividadId), datos.fechaFinalizacion));
    },
  };
}
