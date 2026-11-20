import { db } from '../db/index.js';
import { clientes } from '../db/schema.js';

import {
    desc,
    eq,
    like,
    or,
    sql,
} from 'drizzle-orm';


type NuevoCliente = typeof clientes.$inferInsert;

type DatosCliente = Partial<
    Omit<NuevoCliente, 'id' | 'createdAt'>
>;

export class Clientes {
    static async getAll() {
        return await db
            .select()
            .from(clientes)
            .orderBy(desc(clientes.id));
    }
    static async getById(id: number) {
        const resultado = await db
            .select()
            .from(clientes)
            .where(eq(clientes.id, id))
            .limit(1);

        return resultado[0] ?? null;
    }


    static async create(datos: NuevoCliente) {
        const resultado = await db
            .insert(clientes)
            .values(datos)
            .returning();

        return resultado[0];
    }


    static async update(id: number, datos: DatosCliente) {
        const resultado = await db
            .update(clientes)
            .set(datos)
            .where(eq(clientes.id, id))
            .returning();

        return resultado[0] ?? null;
    }
    static async delete(id: number) {
        const resultado = await db
            .delete(clientes)
            .where(eq(clientes.id, id))
            .returning();

        return resultado.length > 0;
    }
    static async search(termino: string) {
        const busqueda = termino.trim();
        if (!busqueda) {
            return await this.getAll();
        }
        const patron = `%${busqueda}%`;
        const condiciones = [
            like(clientes.nombre, patron),
            like(clientes.apellido, patron),
            like(clientes.email, patron),
            like(clientes.telefono, patron),
            like(clientes.empresa, patron),
            like(clientes.notas, patron),
        ];
        if (/^\d+$/.test(busqueda)) {
            condiciones.push(
                sql`${clientes.id} = ${Number(busqueda)}`
            );
        }

        return await db
            .select()
            .from(clientes)
            .where(or(...condiciones))
            .orderBy(desc(clientes.id));
    }
}