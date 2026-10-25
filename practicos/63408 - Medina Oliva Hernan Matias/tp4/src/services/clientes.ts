import {eq,asc} from 'drizzle-orm';
import {db} from '../db/index.js';
import {clientes,actividades} from '../db/schema.js';
export class ErrorHttp extends Error { constructor(public status:number,mensaje:string){super(mensaje);} }
export function idValido(v:unknown){const n=Number(v);if(!Number.isSafeInteger(n)||n<1)throw new ErrorHttp(400,'Identificador inválido.');return n;}
function objeto(v:unknown):Record<string,unknown>{if(!v||typeof v!=='object'||Array.isArray(v))throw new ErrorHttp(400,'Se esperaba un objeto JSON.');return v as Record<string,unknown>;}
function texto(v:unknown,campo:string,max:number){if(typeof v!=='string'||!v.trim()||v.trim().length>max)throw new ErrorHttp(400,campo+': ingresá entre 1 y '+max+' caracteres.');return v.trim();}
function datosCliente(entrada:unknown){const v=objeto(entrada);const email=texto(v.email,'Correo',254);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new ErrorHttp(400,'Correo electrónico inválido.');return {nombre:texto(v.nombre,'Nombre',120),email,telefono:texto(v.telefono,'Teléfono',50),direccion:texto(v.direccion,'Dirección',250)};}
function datosActividad(entrada:unknown){const v=objeto(entrada);const descripcion=texto(v.descripcion,'Descripción',500);const fecha=v.fecha==null||v.fecha===''?null:v.fecha;
 if(fecha!==null&&(typeof fecha!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(fecha)||!Number.isFinite(Date.parse(fecha))||new Date(fecha).toISOString().slice(0,10)!==fecha))throw new ErrorHttp(400,'Fecha inválida; usá AAAA-MM-DD.');
 return {descripcion,fecha:fecha as string|null};}
const normalizar=(v:unknown)=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
export class Clientes {
 static async listar(q=''){const lista=await db.select().from(clientes).orderBy(asc(clientes.nombre));const terminos=normalizar(q).trim().split(/\s+/).filter(Boolean);return lista.filter(c=>terminos.every(t=>Object.values(c).some(v=>normalizar(v).includes(t))));}
 static async obtener(id:number){const [c]=await db.select().from(clientes).where(eq(clientes.id,id));if(!c)throw new ErrorHttp(404,'Cliente no encontrado.');return c;}
 static async detalle(id:number){return {...await this.obtener(id),actividades:await db.select().from(actividades).where(eq(actividades.clienteId,id)).orderBy(asc(actividades.id))};}
 static async crear(v:unknown){return (await db.insert(clientes).values(datosCliente(v)).returning())[0];}
 static async editar(id:number,v:unknown){await this.obtener(id);return (await db.update(clientes).set(datosCliente(v)).where(eq(clientes.id,id)).returning())[0];}
 static async eliminar(id:number){await this.obtener(id);await db.delete(clientes).where(eq(clientes.id,id));}
}
export class Actividades {
 static async obtener(cid:number,id:number){await Clientes.obtener(cid);const [a]=await db.select().from(actividades).where(eq(actividades.id,id));if(!a||a.clienteId!==cid)throw new ErrorHttp(404,'Actividad no encontrada.');return a;}
 static async pendiente(cid:number,id:number){const a=await this.obtener(cid,id);if(a.completada)throw new ErrorHttp(409,'Las actividades completadas son de solo lectura.');return a;}
 static async crear(cid:number,v:unknown){await Clientes.obtener(cid);return (await db.insert(actividades).values({...datosActividad(v),clienteId:cid}).returning())[0];}
 static async editar(cid:number,id:number,v:unknown){await this.pendiente(cid,id);return (await db.update(actividades).set(datosActividad(v)).where(eq(actividades.id,id)).returning())[0];}
 static async eliminar(cid:number,id:number){await this.pendiente(cid,id);await db.delete(actividades).where(eq(actividades.id,id));}
 static async completar(cid:number,id:number){await this.pendiente(cid,id);return (await db.update(actividades).set({completada:true,completadaEn:new Date().toISOString()}).where(eq(actividades.id,id)).returning())[0];}
}
