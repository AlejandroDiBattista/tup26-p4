// ══════════════════════════════════════════════════════════════════
// clientes.ts — Controladores (Capa de Presentación HTTP)
// ══════════════════════════════════════════════════════════════════
// Los controladores son funciones que reciben un Request y un Response
// de Express. Su responsabilidad es SOLAMENTE:
//   1. Leer datos del request (params, query, body)
//   2. Validar datos básicos de entrada
//   3. Llamar al servicio (lógica de negocio)
//   4. Devolver la respuesta HTTP con el código adecuado
//
// NUNCA deben contener lógica de negocio ni consultas a la BD.
// ══════════════════════════════════════════════════════════════════

import { Request, Response } from "express";
import { Clientes } from "../services/clientes";

// ── Controladores de Clientes ──────────────────────────────────────

/**
 * GET /api/clientes         → Lista todos los clientes
 * GET /api/clientes?q=texto → Busca clientes por cualquier campo
 *
 * Si viene el query param "q", usa búsqueda flexible.
 * Si no viene, devuelve todos los clientes.
 */
export function listarClientes(solicitud: Request, respuesta: Response) {
    // Extraemos el parámetro de búsqueda "q" de la URL (query string)
    const { q } = solicitud.query;

    // Si hay término de búsqueda, buscamos; si no, listamos todo
    const resultado = q ? Clientes.buscar(String(q)) : Clientes.listar();

    // Respondemos con JSON (Express serializa automáticamente el array)
    respuesta.json(resultado);
}

/**
 * GET /api/clientes/:id → Obtiene un cliente por su ID
 *
 * Si no existe, devuelve 404 (No Encontrado)
 */
export function obtenerCliente(solicitud: Request, respuesta: Response) {
    // req.params.id viene como string, lo convertimos a número
    const cliente = Clientes.obtener(Number(solicitud.params.id));

    // Si no se encontró el cliente, respondemos con error 404
    if (!cliente) return respuesta.status(404).json({ error: "Cliente no encontrado" });

    respuesta.json(cliente);
}

/**
 * POST /api/clientes → Crea un nuevo cliente
 *
 * Espera un body JSON con: { nombre, email, telefono, direccion, ciudad }
 * El nombre es obligatorio; los demás son opcionales.
 * Responde con 201 (Created) y el cliente creado.
 */
export function crearCliente(solicitud: Request, respuesta: Response) {
    // Desestructuramos los campos del cuerpo de la solicitud
    const { nombre, email, telefono, direccion, ciudad } = solicitud.body;

    // Validación: el nombre es obligatorio
    if (!nombre) return respuesta.status(400).json({ error: "El nombre es obligatorio" });

    // Llamamos al servicio para crear el cliente
    const cliente = Clientes.crear({ nombre, email, telefono, direccion, ciudad });

    // 201 = recurso creado exitosamente
    respuesta.status(201).json(cliente);
}

/**
 * PUT /api/clientes/:id → Actualiza un cliente existente
 *
 * Espera un body JSON con los campos a modificar.
 * Responde con el cliente actualizado.
 */
export function actualizarCliente(solicitud: Request, respuesta: Response) {
    const { nombre, email, telefono, direccion, ciudad } = solicitud.body;
    const cliente = Clientes.actualizar(
        Number(solicitud.params.id),
        { nombre, email, telefono, direccion, ciudad }
    );

    if (!cliente) return respuesta.status(404).json({ error: "Cliente no encontrado" });
    respuesta.json(cliente);
}

/**
 * DELETE /api/clientes/:id → Elimina un cliente
 *
 * También elimina todas sus actividades (por ON DELETE CASCADE).
 * Responde con { ok: true } si se eliminó correctamente.
 */
export function eliminarCliente(solicitud: Request, respuesta: Response) {
    const cliente = Clientes.eliminar(Number(solicitud.params.id));

    if (!cliente) return respuesta.status(404).json({ error: "Cliente no encontrado" });
    respuesta.json({ ok: true });
}

// ── Controladores de Actividades ───────────────────────────────────

/**
 * GET /api/clientes/:id/actividades → Lista actividades de un cliente
 */
export function listarActividades(solicitud: Request, respuesta: Response) {
    const listaActividades = Clientes.listarActividades(Number(solicitud.params.id));
    respuesta.json(listaActividades);
}

/**
 * POST /api/clientes/:id/actividades → Crea una nueva actividad
 *
 * Espera: { descripcion, fecha? }
 * La descripción es obligatoria, la fecha es opcional.
 */
export function crearActividad(solicitud: Request, respuesta: Response) {
    const { descripcion, fecha } = solicitud.body;

    if (!descripcion) return respuesta.status(400).json({ error: "La descripción es obligatoria" });

    const actividad = Clientes.crearActividad({
        clienteId:    Number(solicitud.params.id),  // ID del cliente padre
        descripcion,
        fecha:        fecha || null,                 // null si no tiene fecha
        completadaEl: null,                          // siempre empieza como pendiente
    });

    respuesta.status(201).json(actividad);
}

/**
 * PUT /api/clientes/:id/actividades/:actId → Edita una actividad
 *
 * Solo se permite editar actividades NO completadas.
 */
export function actualizarActividad(solicitud: Request, respuesta: Response) {
    const { descripcion, fecha } = solicitud.body;

    const actividad = Clientes.actualizarActividad(
        Number(solicitud.params.actId),
        { descripcion, fecha }
    );

    if (!actividad) return respuesta.status(404).json({ error: "Actividad no encontrada" });
    respuesta.json(actividad);
}

/**
 * PATCH /api/clientes/:id/actividades/:actId/completar → Completa una actividad
 *
 * Usamos PATCH porque solo modificamos un campo (completadaEl).
 */
export function completarActividad(solicitud: Request, respuesta: Response) {
    const actividad = Clientes.completarActividad(Number(solicitud.params.actId));

    if (!actividad) return respuesta.status(404).json({ error: "Actividad no encontrada" });
    respuesta.json(actividad);
}

/**
 * DELETE /api/clientes/:id/actividades/:actId → Elimina una actividad
 *
 * Solo se permite eliminar actividades NO completadas.
 */
export function eliminarActividad(solicitud: Request, respuesta: Response) {
    const actividad = Clientes.eliminarActividad(Number(solicitud.params.actId));

    if (!actividad) return respuesta.status(404).json({ error: "Actividad no encontrada" });
    respuesta.json({ ok: true });
}
