// Importamos los tipos de Express para solicitudes y respuestas
import type { Request, Response } from "express";

// Importamos la clase de servicio Clientes
import { Clientes } from "../services/clientes.js";

// ============================================================================
// CONTROLADOR: actualizarActividad (PUT /api/actividades/:id)
// Actualiza una actividad si no está completada
// ============================================================================
export async function actualizarActividad(req: Request, res: Response) {
  try {
    // Obtenemos el ID de la actividad desde los parámetros de la ruta
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "El ID proporcionado es inválido" });
    }

    // Ejecutamos la actualización a través del servicio
    const actividadActualizada = await Clientes.actualizarActividad(id, req.body);

    // Devolvemos la actividad modificada en formato JSON
    res.json(actividadActualizada);
  } catch (error: any) {
    // Si la actividad ya fue completada, respondemos 409 Conflict
    if (error.message.includes("no se pueden editar ni borrar")) {
      return res.status(409).json({ error: error.message });
    }
    // Si no se encuentra la actividad, respondemos 404 Not Found
    if (error.message.includes("no encontrada")) {
      return res.status(404).json({ error: error.message });
    }
    // Para otros errores de datos, respondemos 400 Bad Request
    res.status(400).json({ error: error.message });
  }
}

// ============================================================================
// CONTROLADOR: completarActividad (POST o PATCH /api/actividades/:id/completar)
// Marca una actividad como completada asignándole la fecha de hoy
// ============================================================================
export async function completarActividad(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "El ID proporcionado es inválido" });
    }

    // Llamamos al servicio para completar la actividad
    const actividadCompletada = await Clientes.completarActividad(id);

    // Devolvemos la actividad actualizada
    res.json(actividadCompletada);
  } catch (error: any) {
    const status = error.message.includes("no encontrada") ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
}

// ============================================================================
// CONTROLADOR: eliminarActividad (DELETE /api/actividades/:id)
// Elimina una actividad siempre y cuando esté pendiente
// ============================================================================
export async function eliminarActividad(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "El ID proporcionado es inválido" });
    }

    // Intentamos eliminar la actividad en el servicio
    await Clientes.eliminarActividad(id);

    // Si tuvo éxito, respondemos con 204 No Content
    res.status(204).send();
  } catch (error: any) {
    // Si la actividad ya estaba completada, respondemos 409 Conflict
    if (error.message.includes("no se pueden editar ni borrar")) {
      return res.status(409).json({ error: error.message });
    }
    const status = error.message.includes("no encontrada") ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
}
