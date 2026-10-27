// ══════════════════════════════════════════════════════════════════
// clientes.ts — Servicio (Capa de Negocio)
// ══════════════════════════════════════════════════════════════════
// Este módulo contiene TODA la lógica de negocio de la aplicación.
// Usa una clase con métodos estáticos para que se pueda llamar
// directamente sin crear instancias: Clientes.listar(), etc.
//
// Patrón de diseño: Servicio (Service Layer)
// - Centraliza las reglas de negocio en un solo lugar
// - Los controladores solo se encargan de HTTP (req/res)
// - El servicio se encarga de los datos (queries a la BD)
// ══════════════════════════════════════════════════════════════════

// Importamos la conexión a la base de datos
import { bd } from "../db";

// Importamos las definiciones de tablas del esquema
import { clientes, actividades } from "../db/schema";

// Importamos operadores de Drizzle para construir consultas:
// - eq: igualdad (WHERE campo = valor)
// - like: búsqueda parcial (WHERE campo LIKE '%texto%')
// - or: combinar condiciones con OR
import { eq, like, or } from "drizzle-orm";

// ── Tipos auxiliares de TypeScript ─────────────────────────────────
// Inferimos los tipos de inserción desde el esquema de Drizzle.
// Esto nos da tipado fuerte sin escribir interfaces manualmente.
type DatosNuevoCliente   = typeof clientes.$inferInsert;
type DatosNuevaActividad = typeof actividades.$inferInsert;

// ── Clase de Servicio: Clientes ────────────────────────────────────
export class Clientes {

    // ═══════════════════════════════════════════════════════════════
    //  CRUD DE CLIENTES
    // ═══════════════════════════════════════════════════════════════

    /**
     * Listar todos los clientes de la base de datos.
     * No recibe parámetros, devuelve un array con todos los registros.
     * Equivale a: SELECT * FROM clientes
     */
    static listar() {
        return bd.select().from(clientes).all();
    }

    /**
     * Obtener un único cliente por su ID.
     * .get() devuelve un solo registro (o undefined si no existe).
     * Equivale a: SELECT * FROM clientes WHERE id = ?
     */
    static obtener(id: number) {
        return bd.select().from(clientes).where(eq(clientes.id, id)).get();
    }

    /**
     * Búsqueda flexible por cualquier campo.
     * Recibe un término de búsqueda y lo busca con LIKE en todos
     * los campos del cliente (nombre, email, teléfono, dirección, ciudad).
     * El patrón '%termino%' busca coincidencias parciales.
     * Equivale a: SELECT * FROM clientes
     *   WHERE nombre LIKE '%t%' OR email LIKE '%t%' OR ...
     */
    static buscar(termino: string) {
        const patron = `%${termino}%`;
        return bd.select().from(clientes).where(
            or(
                like(clientes.nombre,    patron),
                like(clientes.email,     patron),
                like(clientes.telefono,  patron),
                like(clientes.direccion, patron),
                like(clientes.ciudad,    patron),
            )
        ).all();
    }

    /**
     * Crear un nuevo cliente en la base de datos.
     * Recibe un objeto con los datos (sin id, porque se autogenera).
     * .returning().get() devuelve el registro recién creado con su id.
     * Equivale a: INSERT INTO clientes (...) VALUES (...) RETURNING *
     */
    static crear(datos: Omit<DatosNuevoCliente, "id">) {
        return bd.insert(clientes).values(datos).returning().get();
    }

    /**
     * Actualizar un cliente existente.
     * Partial<> significa que no es obligatorio enviar todos los campos,
     * solo los que se quieren modificar.
     * Equivale a: UPDATE clientes SET ... WHERE id = ? RETURNING *
     */
    static actualizar(id: number, datos: Partial<Omit<DatosNuevoCliente, "id">>) {
        return bd.update(clientes).set(datos).where(eq(clientes.id, id)).returning().get();
    }

    /**
     * Eliminar un cliente por ID.
     * Gracias al ON DELETE CASCADE del esquema, también se eliminan
     * automáticamente todas sus actividades asociadas.
     * Equivale a: DELETE FROM clientes WHERE id = ? RETURNING *
     */
    static eliminar(id: number) {
        return bd.delete(clientes).where(eq(clientes.id, id)).returning().get();
    }

    // ═══════════════════════════════════════════════════════════════
    //  CRUD DE ACTIVIDADES
    // ═══════════════════════════════════════════════════════════════

    /**
     * Listar todas las actividades de un cliente específico.
     * Equivale a: SELECT * FROM actividades WHERE cliente_id = ?
     */
    static listarActividades(idCliente: number) {
        return bd.select().from(actividades)
            .where(eq(actividades.clienteId, idCliente))
            .all();
    }

    /**
     * Crear una nueva actividad para un cliente.
     * Equivale a: INSERT INTO actividades (...) VALUES (...) RETURNING *
     */
    static crearActividad(datos: Omit<DatosNuevaActividad, "id">) {
        return bd.insert(actividades).values(datos).returning().get();
    }

    /**
     * Actualizar una actividad existente (descripción y/o fecha).
     * Solo se debería llamar si la actividad NO está completada.
     * Esa validación se hace en el frontend.
     * Equivale a: UPDATE actividades SET ... WHERE id = ? RETURNING *
     */
    static actualizarActividad(id: number, datos: Partial<Pick<DatosNuevaActividad, "descripcion" | "fecha">>) {
        return bd.update(actividades)
            .set(datos)
            .where(eq(actividades.id, id))
            .returning()
            .get();
    }

    /**
     * Marcar una actividad como completada.
     * Guarda la fecha actual en el campo completadaEl.
     * Una vez completada, la actividad no se puede editar ni borrar.
     * Equivale a: UPDATE actividades SET completada_el = '2026-10-20' WHERE id = ?
     */
    static completarActividad(id: number) {
        // Obtenemos la fecha de hoy en formato ISO (YYYY-MM-DD)
        const hoy = new Date().toISOString().split("T")[0];
        return bd.update(actividades)
            .set({ completadaEl: hoy })
            .where(eq(actividades.id, id))
            .returning()
            .get();
    }

    /**
     * Eliminar una actividad por su ID.
     * Solo se debería llamar si la actividad NO está completada.
     * Equivale a: DELETE FROM actividades WHERE id = ? RETURNING *
     */
    static eliminarActividad(id: number) {
        return bd.delete(actividades)
            .where(eq(actividades.id, id))
            .returning()
            .get();
    }
}
