import { db } from "./db/index.ts";
import { actividades, clientes } from "./db/esquema.ts";
import { eq, like, or } from "drizzle-orm";

export class Clientes {
    static async buscar(texto: string) {
        return await db
            .select()
            .from(clientes)
            .where(or(
                like(clientes.nombre, `%${texto}%`),
                like(clientes.direccion, `%${texto}%`),
                like(clientes.telefono, `%${texto}%`),
                like(clientes.email, `%${texto}%`)
            ));
    }

    static async completarActividad(id: number) {
        const [actividad] = await db
            .select()
            .from(actividades)
            .where(eq(actividades.id, id));

        if (!actividad) {
            throw new Error("Actividad no encontrada");
        }
        if (actividad.completada === true) {
            throw new Error("La actividad ya está completada");
        }

        const [actualizada] = await db
            .update(actividades)
            .set({
                completada: true,
                fechaCompletada: new Date().toISOString().slice(0, 10)
            })
            .where(eq(actividades.id, id))
            .returning();

        return actualizada;
    }

    static async agregarActividad(clienteId: number, datos: { descripcion: string; fecha?: string }) {
        if (!datos.descripcion || datos.descripcion.trim() === "") {
            throw new Error("La descripcion es obligatoria");
        }

        const [actividad] = await db
            .insert(actividades)
            .values({ ...datos, clienteId })
            .returning();

        return actividad;
    }

    static async actividades(clienteId: number) {
        return await db
            .select()
            .from(actividades)
            .where(eq(actividades.clienteId, clienteId));
    }

    static async eliminar(id: number) {
        const eliminados = await db
            .delete(clientes)
            .where(eq(clientes.id, id))
            .returning();

        return eliminados.length > 0;
    }

    static async obtener(id: number) {
        const [cliente] = await db
            .select()
            .from(clientes)
            .where(eq(clientes.id, id));

        return cliente;
    }

    static async crear(datos: typeof clientes.$inferInsert) {
        if (!datos.nombre || datos.nombre.trim() === "") {
            throw new Error("El nombre es obligatorio");
        }
        if (!datos.email || datos.email.trim() === "") {
            throw new Error("El email es obligatorio");
        }

        const [cliente] = await db
            .insert(clientes)
            .values(datos)
            .returning();

        return cliente;
    }
}