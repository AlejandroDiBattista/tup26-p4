// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/api/auth/me/route.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// GET /api/auth/me (RF-U2).
// Devuelve los datos del usuario conectado o 401 si no hay sesión válida.
// Acá importamos NextResponse para devolver respuestas HTTP en formato JSON
import { NextResponse } from "next/server";
// Acá importamos los adaptadores conSesionApi y manejo estándar de errores HTTP
import { conSesionApi } from "@/lib/adaptadores";

// Endpoint API GET: atiende peticiones de consulta y devuelve los datos en JSON
export async function GET() {
  return conSesionApi(async (usuario) => NextResponse.json(usuario, { status: 200 }));
}
