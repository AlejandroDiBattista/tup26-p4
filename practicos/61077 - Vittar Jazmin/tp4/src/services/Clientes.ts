import { and, asc, count, eq, like, or, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { actividades, clientes } from "../db/schema.js";

export class Clientes {
    // buscar clientes por cualquier campo de texto o por su ID
    static async buscar(termino = "") {
        const busqueda = termino.trim();

        if (!busqueda) {
            return db.select().from(clientes).orderBy(asc(clientes.apellido), asc(clientes.nombre));
        }

        const patron = `%${busqueda}%`;

        return db
            .select()
            .from(clientes)
            .where(
                or(
                    like(clientes.nombre, patron),
                    like(clientes.apellido, patron),
                    like(clientes.email, patron),
                    like(clientes.domicilio, patron),
                    like(clientes.localidad, patron),
                    like(clientes.telefono, patron),
                    like(sql`cast(${clientes.id} as text)`, patron),
                ),
            )
            .orderBy(asc(clientes.apellido), asc(clientes.nombre));
    }

    // obtener cliente por ID
    static async obtenerPorId(id: number) {
        const [cliente] = await db
            .select()
            .from(clientes)
            .where(eq(clientes.id, id));

        return cliente ?? null;
    }

    // crear un cliente
    static async crear(datos: typeof clientes.$inferInsert) {
        const nuevoCliente = {
            ...datos,
            nombre: datos.nombre.trim(),
            apellido: datos.apellido.trim(),
            email: datos.email.trim().toLowerCase(),
            domicilio: datos.domicilio?.trim() || null,
            localidad: datos.localidad?.trim() || null,
            telefono: datos.telefono?.trim() || null,
        };

        const [cliente] = await db
            .insert(clientes)
            .values(nuevoCliente)
            .returning();

        return cliente;
    }

    // modificar datos de un cliente existente
    static async actualizar(
        id: number,
        datos: Partial<typeof clientes.$inferInsert>,
    ) {
        const cambios = { ...datos };

        if (cambios.nombre !== undefined) {
            cambios.nombre = cambios.nombre.trim();
        }
        if (cambios.apellido !== undefined) {
            cambios.apellido = cambios.apellido.trim();
        }
        if (cambios.email !== undefined) {
            cambios.email = cambios.email.trim().toLowerCase();
        }
        if (cambios.domicilio !== undefined) {
            cambios.domicilio = cambios.domicilio?.trim() || null;
        }
        if (cambios.localidad !== undefined) {
            cambios.localidad = cambios.localidad?.trim() || null;
        }
        if (cambios.telefono !== undefined) {
            cambios.telefono = cambios.telefono?.trim() || null;
        }

        const [cliente] = await db
            .update(clientes)
            .set(cambios)
            .where(eq(clientes.id, id))
            .returning();

        return cliente ?? null;
    }

    // eliminar un cliente y sus actividades relacionadas
    static async eliminar(id: number) {
        const [cliente] = await db
            .delete(clientes)
            .where(eq(clientes.id, id))
            .returning();

        return cliente ?? null;
    }

    // listar actividades de un cliente
    static async listarActividades(clienteId: number) {
        return db
            .select()
            .from(actividades)
            .where(eq(actividades.clienteId, clienteId))
            .orderBy(asc(actividades.fechaCompromiso), asc(actividades.id));
    }

    // crear actividad pendiente para un cliente
    static async crearActividad(
        clienteId: number,
        datos: Pick<
            typeof actividades.$inferInsert,
            "descripcion" | "fechaCompromiso"
        >,
    ) {
        const cliente = await this.obtenerPorId(clienteId);

        if (!cliente) {
            throw new Error("No existe el cliente indicado");
        }

        const descripcion = datos.descripcion.trim();

        if (!descripcion) {
            throw new Error("La descripción de la actividad es obligatoria");
        }

        const [actividad] = await db
            .insert(actividades)
            .values({
                clienteId,
                descripcion,
                fechaCompromiso: datos.fechaCompromiso || null,
                fechaFinalizacion: null,
            })
            .returning();

        return actividad;
    }

    // modificar una actividad pendiente
    static async actualizarActividad(
        id: number,
        datos: Partial<
            Pick<typeof actividades.$inferInsert, "descripcion" | "fechaCompromiso">
        >,
    ) {
        const [existente] = await db
            .select()
            .from(actividades)
            .where(eq(actividades.id, id));

        if (!existente) {
            return null;
        }

        if (existente.fechaFinalizacion !== null) {
            throw new Error("No se puede modificar una actividad completada");
        }

        const cambios: Partial<typeof actividades.$inferInsert> = {};

        if (datos.descripcion !== undefined) {
            const descripcion = datos.descripcion.trim();

            if (!descripcion) {
                throw new Error("La descripción de la actividad es obligatoria");
            }

            cambios.descripcion = descripcion;
        }

        if (datos.fechaCompromiso !== undefined) {
            cambios.fechaCompromiso = datos.fechaCompromiso || null;
        }

        const [actualizada] = await db
            .update(actividades)
            .set(cambios)
            .where(eq(actividades.id, id))
            .returning();

        return actualizada ?? null;
    }

    // eliminar una actividad únicamente si está pendiente
    static async eliminarActividad(id: number) {
        const [existente] = await db
            .select()
            .from(actividades)
            .where(eq(actividades.id, id));

        if (!existente) {
            return null;
        }

        if (existente.fechaFinalizacion !== null) {
            throw new Error("No se puede eliminar una actividad completada");
        }

        const [eliminada] = await db
            .delete(actividades)
            .where(eq(actividades.id, id))
            .returning();

        return eliminada ?? null;
    }

    // marcar una actividad como completada con fecha actual
    static async completarActividad(id: number) {
        const [existente] = await db
            .select()
            .from(actividades)
            .where(eq(actividades.id, id));

        if (!existente) {
            return null;
        }

        if (existente.fechaFinalizacion !== null) {
            throw new Error("La actividad ya está completada");
        }

        const fechaActual = new Date().toISOString().slice(0, 10);

        const [completada] = await db
            .update(actividades)
            .set({ fechaFinalizacion: fechaActual })
            .where(
                and(
                    eq(actividades.id, id),
                    sql`${actividades.fechaFinalizacion} is null`,
                ),
            )
            .returning();

        if (!completada) {
            throw new Error("No se pudo completar la actividad");
        }

        return completada;
    }

    // devolver la cantidad de registros de ambas tablas
    static async contarRegistros() {
        const [totalClientes] = await db
            .select({ total: count() })
            .from(clientes);

        const [totalActividades] = await db
            .select({ total: count() })
            .from(actividades);

        return {
            clientes: totalClientes.total,
            actividades: totalActividades.total,
        };
    }
}
