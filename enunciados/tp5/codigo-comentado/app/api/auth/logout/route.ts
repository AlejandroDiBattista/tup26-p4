// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/api/auth/logout/route.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// POST /api/auth/logout (RF-U1).
// Cierra la sesión borrando la cookie httpOnly y responde 204.
// Acá importamos NextResponse para devolver respuestas HTTP en formato JSON
import { NextResponse } from "next/server";
// Acá importamos los adaptadores conSesionApi y manejo estándar de errores HTTP
import { conSesionApi } from "@/lib/adaptadores";
// Acá importamos las funciones para leer y validar la sesión del usuario conectado
import { NOMBRE_COOKIE_SESION } from "@/lib/sesion";

// Endpoint API POST: recibe datos del formulario y crea un nuevo registro
export async function POST() {
  return conSesionApi(async () => {
    const respuesta = new NextResponse(null, { status: 204 });
    respuesta.cookies.delete(NOMBRE_COOKIE_SESION);
    return respuesta;
  });
}
