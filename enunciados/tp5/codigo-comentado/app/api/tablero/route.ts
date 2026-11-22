// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/api/tablero/route.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// GET /api/tablero (RF-T1 a RF-T3).
// Acá importamos NextResponse para devolver respuestas HTTP en formato JSON
import { NextResponse } from "next/server";
// Acá importamos los adaptadores conSesionApi y manejo estándar de errores HTTP
import { conSesionApi } from "@/lib/adaptadores";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { obtenerTablero } from "@/servicios/tablero";

// Endpoint API GET: atiende peticiones de consulta y devuelve los datos en JSON
export async function GET() {
  return conSesionApi(async (usuario) => {
    const resultado = await obtenerTablero(usuario);
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(resultado, { status: 200 });
  });
}
