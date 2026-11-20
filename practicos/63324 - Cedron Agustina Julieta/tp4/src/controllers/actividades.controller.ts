import {Request, Response} from 'express';
import {Clientes } from '../services/Clientes.js';

// get: trarer las actividades vinculadas a un cliente
export const getActividades= async (req:Request, res:Response)=>{
    try {
        const clienteId= Number(req.params.id);
        const lista= await Clientes.listarActividad(clienteId);

        res.json(lista);
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
};

//post: agregar una nueva actividad a la lista del cliente

export const postActividad= async (req: Request, res:Response)=>{
    try {
        const clienteId= Number(req.params.id);
        // Combinar del cliente de la ruta con la descripción y fecha que vienen en el body
        const nueva= await Clientes.crearActividad({
            ...req.body,
            clienteId:clienteId
        });
        res.status(201).json(nueva);
    } catch (error:any) {
        res.status(500).json({error: error.message});
    }
};

//put: modificar una actividad existente
export const putActividad= async (req:Request, res:Response)=>{
    try {
        const actividadId= Number(req.params.actividadId);
        const editada= await Clientes.actualizarActividad(actividadId, req.body);

        if (!editada) {
            return res.status(404).json({error: 'Activiidad no encontrada'});
        }
        res.json(editada);
    } catch (error: any) {
        res.status(505).json({error: error.message});
    }
};

// patch: actualizamos un campo puntual
export const completarActividad = async(req:Request, res:Response)=>{
    try {
        const actividadId= Number(req.params.actividadId);
        const completada= await Clientes.completarActividad(actividadId);

        if (!completada) {
            return res.status(404).json({error: 'Actividad no encontrada'});
        }
    } catch (error: any) {
        res.status(505).json({error: error.message});
    }
};

//delete:eliminar una actividad pendiente
export const deleteActividad= async (req: Request, res: Response)=>{
    try {
        const actividadId= Number(req.params.actividadId);
        const eliminada= Clientes.eliminarActividad(actividadId);

        if (!eliminada) {
            return res.status(404).json({error:'Actividad no encontrada'});
        }
        res.json({mensaje: 'Actividad eliminada con éxito'})
    } catch (error: any) {
        res.status(505).json({error: error.message});
    }
};

