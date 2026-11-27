import {and,eq} from 'drizzle-orm'
import {base,clientes,actividades} from './base.js'

export class Fallo extends Error {
  constructor(public estado:number,mensaje:string){super(mensaje)}
}
function texto(valor:unknown){
  if(typeof valor!=='string'||!valor.trim())throw new Fallo(400,'Completá los campos')
  return valor.trim()
}
type Datos=Record<string,unknown>
function ficha(datos:Datos){
  return {nombre:texto(datos.nombre),correo:texto(datos.correo),telefono:texto(datos.telefono)}
}
export class Clientes {
  static listar(busqueda:string){
    const normalizar=(s:unknown)=>String(s).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase()
    return base.select().from(clientes).all().filter(c=>Object.values(c).some(v=>normalizar(v).includes(normalizar(busqueda.trim()))))
  }
  static ver(id:number){
    const cliente=base.select().from(clientes).where(eq(clientes.id,id)).get()
    if(!cliente)throw new Fallo(404,'Cliente inexistente')
    return {...cliente,actividades:base.select().from(actividades).where(eq(actividades.cliente,id)).all()}
  }
  static agregar(datos:Datos){return base.insert(clientes).values(ficha(datos)).returning().get()}
  static editar(id:number,datos:Datos){
    this.ver(id)
    return base.update(clientes).set(ficha(datos)).where(eq(clientes.id,id)).returning().get()
  }
  static borrar(id:number){this.ver(id);base.delete(clientes).where(eq(clientes.id,id)).run()}
  static agregarActividad(id:number,datos:Datos){
    this.ver(id)
    return base.insert(actividades).values({cliente:id,detalle:texto(datos.detalle),fecha:texto(datos.fecha)}).returning().get()
  }
  static cambiarActividad(id:number,numero:number,datos:Datos,accion:'editar'|'completar'|'borrar'){
    const filtro=and(eq(actividades.cliente,id),eq(actividades.id,numero))
    const actividad=base.select().from(actividades).where(filtro).get()
    if(!actividad)throw new Fallo(404,'Actividad inexistente')
    if(actividad.completa)throw new Fallo(409,'La actividad ya está completa')
    if(accion==='borrar'){base.delete(actividades).where(filtro).run();return}
    const cambio=accion==='completar'?{completa:true}:{detalle:texto(datos.detalle),fecha:texto(datos.fecha)}
    return base.update(actividades).set(cambio).where(filtro).returning().get()
  }
}