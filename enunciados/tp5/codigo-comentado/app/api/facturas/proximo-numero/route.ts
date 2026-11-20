// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/api/facturas/proximo-numero/route.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// GET /api/facturas/proximo-numero (RF-V1).
// Acá importamos NextResponse para devolver respuestas HTTP en formato JSON
import { NextResponse } from "next/server";
// Acá importamos los adaptadores conSesionApi y manejo estándar de errores HTTP
import { conSesionApi } from "@/lib/adaptadores";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { obtenerProximoNumeroFactura } from "@/servicios/facturas";

// Endpoint API GET: atiende peticiones de consulta y devuelve los datos en JSON
export async function GET() {
  return conSesionApi(async (usuario) => {
    const resultado = await obtenerProximoNumeroFactura(usuario);
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(resultado, { status: 200 });
  });
}
