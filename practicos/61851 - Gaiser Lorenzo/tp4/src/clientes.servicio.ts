import { db } from "./db/index.ts";
import { clientes } from "./db/esquema.ts";
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