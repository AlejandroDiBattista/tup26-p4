//conexion con la db
import {db} from '../db/index.js';

import {clientes, actividades, NuevoCliente, NuevaActividad} from '../db/schema.js';


//drizzle= operadoress
import {eq, like, or} from 'drizzle-orm';

//clase de servicio de clientes
export class Clientes{
    //CRUD
    static async listar(criterio?: string){
        if (!criterio || criterio.trim()=== '') {
            return await db.select().from(clientes);
        }
        const patron = `%${criterio}%`;

        //ejecutar la consulta
         return await db.select().from(clientes).where(
            or(
                like(clientes.nombre, patron),
                like(clientes.email, patron),
                like(clientes.telefono, patron),
                like(clientes.direccion, patron),
                like(clientes.ciudad, patron)
            )
         );
    }
    //obtener por medio del id
    static async obtenerPorId(id: number){
        //consulta
        const res = await db.select().from(clientes).where(eq(clientes.id,id));
        // devuelve el primer elemento si es que se encontro un registro, si no devuelve null
        return res[0] || null;
    }
    //crear un cliente
    static async crearCliente (datos:NuevoCliente){
        const res= await db.insert(clientes).values(datos).returning();
        return res[0];// aqui devolvemos el cliente creado    
    }
    //actualizar cliente
    static async actualizarCliente(id: number, datos: Partial<NuevoCliente>){
        const res= await db.update(clientes).set(datos).where(eq(clientes.id, id)).returning();
        return res[0] || null;
    }
    //eliminar un cliente
    static async eliminarCliente(id:number){
        const res= await db.delete(clientes).where(eq(clientes.id, id)).returning();
        return res[0] || null;
    }
    
    //operaciones con actividades

    //istar actividades
    static async listarActividad(clienteId: number){
        return await db.select().from(actividades).where(eq(actividades.clienteId, clienteId));
    }

    // crear actividad
    static async crearActividad(datos: NuevaActividad){
        const res= await db.insert(actividades).values(datos).returning();
        return res[0];
    }

    //actualizar actividad
    static async actualizarActividad(id: number,datos: Partial<NuevaActividad>){
        //buscamos la actividad para saber su estado
        const existente= await db.select().from(actividades).where(eq(actividades.id, id));

        //si no existe, no se edita nadita
        if (!existente[0]) {
            return null;
        }
        //comprobar la regla de negocio
        if(existente[0].completada){
            throw new Error('Regla de negocio infringida: Las actividades completadas no se pueden editar.');
        }
        //actualizamos si sigue pendiente
        const res = await db.update(actividades).set(datos).where(eq(actividades.id,id)).returning();
        return res[0];
    }

    //completar acividad
    static async completarActividad(id: number){
        const res= await db.update(actividades).set({completada: true}).where(eq(actividades.id,id)).returning();
        return res[0] || null;
    }
    //eliminar actividad
    static async eliminarActividad(id: number){
        //verificamos si existe y que estado tiene
        const existente= await db.select().from(actividades).where(eq(actividades.id, id));

        if (!existente[0]) {
            return null;
        }
        //si esta completa, se impide borrar
        if (existente[0].completada) {
            throw new Error ('Regla de negocio infringida: Las actividades completadas no se pueden borrar individualmente.');
        }
        //si es pendiente, lo borramos de la bd
        const res= await db.delete(actividades).where(eq(actividades.id, id)).returning();
        return res[0];
        
    }

}