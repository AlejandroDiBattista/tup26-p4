import {Request, Response} from 'express';
import {Clientes} from '../services/Clientes.js';

//get: traer todos los clientes o filtrar por busqueda

export const getClientes= async (req: Request, res:Response)=>{
    try{
        //capturar lo que viene en la url
        const criterio = req.query.buscar as string | undefined;

        //damos la busqueda o la lista al servicio
        const lista= await Clientes.listar(criterio);

        //respondemos con 200 de todo ok en formato json
        res.json(lista);
    }catch(error: any){
        //500 si falló la conexion con la bd o un error inesperado
        res.status(500).json({error: error.message});    
    }
    
};

//get: clientes por id

export const getClienteId =async(req: Request, res: Response)=>{
    try {
        //parseamos los valores a numeros ya que llegan en string
        const id= Number(req.params.id);
        const cliente = await Clientes.obtenerPorId(id);

        //si no se encontró
        if (!cliente) {
            return res.status(404).json({error: 'Cliente no encontrado'});
        }
        res.json(cliente);
    } catch (error: any) {
        res.status(500).json({erro:error.message});
    }
};

//post: agregar un nuevo cliente

export const postCliente= async (req: Request, res: Response)=>{
    try{
        // req.body contiene los campos enviados desde el formulario
        const nuevo= await Clientes.crearCliente(req.body);

        //201 creado exitosamente
        res.status(201).json(nuevo);
    }catch(error: any){
       res.status(400).json({error:error.message}); 
    }
};

//put: modificar los datos de un cliente existente
export const putCliente= async(req: Request, res:Response)=>{
    try {
        const id= Number(req.params.id);
        const actualizado= await Clientes.actualizarCliente(id,req.body);

        if (!actualizado) {
          return res.status(404).json({error: 'Cliente no encontrado para actualizar'});
        }

        res.json(actualizado);
    } catch (error: any) {
        res.status(400).json({error: error.message});
    }
};

//delete: eliminar un cliente y sus actividades asociadas por cascada
export const deleteCliente=async(req: Request, res: Response)=>{
    try {
        const id= Number(req.params.id);
        const eliminado= await Clientes.eliminarCliente(id);
        if (!eliminado) {
            return res.status(404).json({error: 'Cliente no encontrado para eliminar'});
        }
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }

};
