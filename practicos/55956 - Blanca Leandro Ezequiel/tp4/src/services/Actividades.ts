import { db } from '../db/index.js';
import { actividades } from '../db/schema.js';

import {
    and,
    desc,
    eq,
} from 'drizzle-orm';

// Tipos de datos
type NuevaActividad = typeof actividades.$inferInsert;

type DatosNuevaActividad = Pick<
    NuevaActividad,
    'titulo' | 'descripcion' | 'fecha'
>;

type DatosActualizarActividad = Partial<DatosNuevaActividad>;

export class Actividades {

    // Obtener todas las actividades de un cliente
    static async getByClienteId(clienteId: number) {
        return await db
            .select()
            .from(actividades)
            .where(eq(actividades.clienteId, clienteId))
            .orderBy(desc(actividades.createdAt));
    }

    // Obtener una actividad por su ID
    static async getById(id: number) {
        const resultado = await db
            .select()
            .from(actividades)
            .where(eq(actividades.id, id))
            .limit(1);

        return resultado[0] ?? null;
    }

    // Crear una actividad
    static async create(
        clienteId: number,
        datos: DatosNuevaActividad
    ) {
        const resultado = await db
            .insert(actividades)
            .values({
                clienteId,
                ...datos,
            })
            .returning();

        return resultado[0];
    }

    // Modificar una actividad pendiente
    static async update(
        id: number,
        datos: DatosActualizarActividad
    ) {
        const resultado = await db
            .update(actividades)
            .set(datos)
            .where(
                and(
                    eq(actividades.id, id),
                    eq(actividades.completada, false)
                )
            )
            .returning();

        return resultado[0] ?? null;
    }

    // Completar una actividad
    static async complete(id: number) {
        const resultado = await db
            .update(actividades)
            .set({
                completada: true,
            })
            .where(
                and(
                    eq(actividades.id, id),
                    eq(actividades.completada, false)
                )
            )
            .returning();

        return resultado[0] ?? null;
    }

    // Eliminar una actividad pendiente
    static async delete(id: number) {
        const resultado = await db
            .delete(actividades)
            .where(
                and(
                    eq(actividades.id, id),
                    eq(actividades.completada, false)
                )
            )
            .returning();

        return resultado.length > 0;
    }
}