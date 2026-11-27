import type {Request,Response} from 'express'
import {Clientes} from './clientes.js'
export const listar=(p:Request,r:Response)=>r.json(Clientes.listar(String(p.query.buscar??'')))
export const ver=(p:Request,r:Response)=>r.json(Clientes.ver(Number(p.params.id)))
export const agregar=(p:Request,r:Response)=>r.status(201).json(Clientes.agregar(p.body??{}))
export const editar=(p:Request,r:Response)=>r.json(Clientes.editar(Number(p.params.id),p.body??{}))
export function borrar(p:Request,r:Response){Clientes.borrar(Number(p.params.id));r.sendStatus(204)}
export const actividad=(p:Request,r:Response)=>r.status(201).json(Clientes.agregarActividad(Number(p.params.id),p.body??{}))
export function cambiar(accion:'editar'|'completar'|'borrar'){
  return (p:Request,r:Response)=>{
    const resultado=Clientes.cambiarActividad(Number(p.params.id),Number(p.params.numero),p.body??{},accion)
    if(resultado)r.json(resultado)
    else r.sendStatus(204)
  }
}