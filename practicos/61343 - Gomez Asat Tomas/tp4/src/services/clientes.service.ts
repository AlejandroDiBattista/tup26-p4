import { db } from "../db";
import { clientes, actividades } from "../db/schema";
import { eq, like, or } from "drizzle-orm";
export const ClientesService = {
    async listar(busqueda?: string) {
        if (!busqueda) {
            return db.select().from(clientes);
        }
        const termino = `%${busqueda}%`;
        return db 
        .select()
        .from(clientes)
        .where(or(
            like(clientes.nombre, termino),
            like(clientes.email, termino),
            like(clientes.telefono, termino),
            like(clientes.empresa, termino)
        )
    );
},
async obtenerPorId(id: number) {
    const cliente = await db
    .select()
    .from(clientes)
    .where(eq(clientes.id, id))
    .get();
    
    if (!cliente) return null;
    const actividadesCliente = await db
    .select()
    .from(actividades)
    .where(eq(actividades.clienteId, id));
    return { ...cliente, actividades: actividadesCliente };
},
async crear(datos: {
    nombre: string;
    email?: string;
    telefono?: string;
    empresa?: string;
}){
    const resultado = await db.insert(clientes).values(datos).returning();
    return resultado[0];
},
async editar(
    id: number,
    datos: Partial<{
        nombre: string;
        email: string;
        telefono: string;
        empresa: string;
    }>
){
    const resultado = await db 
    .update(clientes)
    .set(datos) 
    .where(eq(clientes.id, id))
    .returning();
    return resultado[0] ?? null;
},
async eliminar(id: number){ //eliminacion en cascada de actividades asociadas al cliente
    await db.delete(actividades).where(eq(actividades.clienteId, id));
    const resultado = await db
    .delete(actividades)
    .where(eq(clientes.id, id))
    .returning();
    return resultado[0] ?? null;
},
async crearActividad(datos: {
    clienteId: number;
    descripcion: string;
    fecha: string;
}) {
    const resultado = await db.insert(actividades).values(datos).returning();
    return resultado[0];
},
async editarActividad(
    id: number,
    datos: Partial<{
        descripcion: string;
        fecha: string;}>){
    const actividad = await db
    .select()
    .from(actividades)
    .where(eq(actividades.id, id))
    .get();
    if (!actividad) return null;
    if (actividad.completada){
        throw new Error("No se puede editar una actividad completada");
    }
    const resultado =await db 
    .update(actividades)
    .set(datos)
    .where(eq(actividades.id, id))
    .returning();
    return resultado[0];    
},
async eliminarActividad(id: number){
    const actividad = await db
    .select()
    .from(actividades)
    .where(eq(actividades.id, id))  
    .get();
    if (!actividad) return null;
    if (actividad.completada){
        throw new Error("No se puede eliminar una actividad completada");
    }
    const resultado = await db
    .delete(actividades)
    .where(eq(actividades.id, id))
    .returning();
    return resultado[0];
},
async marcarCompletada(id: number, completada: boolean){
    const resultado = await db
    .update(actividades)
    .set({ completada })
    .where(eq(actividades.id, id))
    .returning();
    return resultado[0] ?? null;
},
};