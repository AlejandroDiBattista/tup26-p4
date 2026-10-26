import { eq, like, or } from "drizzle-orm";
import { db } from "./db.js";
import { clientes, actividades } from "./esquema.js";

type DatosCliente = {
    nombre: string;
    email: string;
    telefono?: string;
    direccion?: string;
};

type DatosActividad = {
    descripcion: string;
    fecha?: string;
};

export class Clientes {
    static listar(texto = "") {
        const buscado = texto.trim();
        if (buscado === "") {
            return db.select().from(clientes).all();
        }
        const patron = `%${buscado}%`;
        return db
            .select()
            .from(clientes)
            .where(
                or(
                    like(clientes.nombre, patron),
                    like(clientes.email, patron),
                    like(clientes.telefono, patron),
                    like(clientes.direccion, patron)
                )
            )
            .all();
    }

    static obtener(id: number) {
        const cliente = db.select().from(clientes).where(eq(clientes.id, id)).get();
        if (!cliente) {
            throw new Error("Cliente no encontrado");
        }
        const lasActividades = db
            .select()
            .from(actividades)
            .where(eq(actividades.clienteId, id))
            .all();
        return { ...cliente, actividades: lasActividades };
    }

    static crear(datos: DatosCliente) {
        if (!datos.nombre || !datos.email) {
            throw new Error("El nombre y el email son obligatorios");
        }
        return db.insert(clientes).values(datos).returning().get();
    }

    static actualizar(id: number, datos: DatosCliente) {
        if (!datos.nombre || !datos.email) {
            throw new Error("El nombre y el email son obligatorios");
        }
        const cliente = db
            .update(clientes)
            .set(datos)
            .where(eq(clientes.id, id))
            .returning()
            .get();
        if (!cliente) {
            throw new Error("Cliente no encontrado");
        }
        return cliente;
    }

    static eliminar(id: number) {
        const resultado = db.delete(clientes).where(eq(clientes.id, id)).run();
        if (resultado.changes === 0) {
            throw new Error("Cliente no encontrado");
        }
    }

    static buscarActividad(id: number) {
        const actividad = db
            .select()
            .from(actividades)
            .where(eq(actividades.id, id))
            .get();
        if (!actividad) {
            throw new Error("Actividad no encontrada");
        }
        return actividad;
    }

    static agregarActividad(clienteId: number, datos: DatosActividad) {
        Clientes.obtener(clienteId);
        if (!datos.descripcion) {
            throw new Error("La descripción es obligatoria");
        }
        return db
            .insert(actividades)
            .values({ clienteId, descripcion: datos.descripcion, fecha: datos.fecha })
            .returning()
            .get();
    }

    static editarActividad(id: number, datos: DatosActividad) {
        const actividad = Clientes.buscarActividad(id);
        if (actividad.completada) {
            throw new Error("No se puede editar una actividad completada");
        }
        if (!datos.descripcion) {
            throw new Error("La descripción es obligatoria");
        }
        return db
            .update(actividades)
            .set({ descripcion: datos.descripcion, fecha: datos.fecha })
            .where(eq(actividades.id, id))
            .returning()
            .get();
    }

    static completarActividad(id: number) {
        Clientes.buscarActividad(id);
        const hoy = new Date().toISOString().slice(0, 10);
        return db
            .update(actividades)
            .set({ completada: true, fechaCompletada: hoy })
            .where(eq(actividades.id, id))
            .returning()
            .get();
    }

    static eliminarActividad(id: number) {
        const actividad = Clientes.buscarActividad(id);
        if (actividad.completada) {
            throw new Error("No se puede borrar una actividad completada");
        }
        db.delete(actividades).where(eq(actividades.id, id)).run();
    }
}