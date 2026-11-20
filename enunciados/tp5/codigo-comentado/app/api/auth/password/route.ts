// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/api/auth/password/route.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// PUT /api/auth/password (RF-U5).
// Permite al usuario autenticado cambiar su propia contraseña.
// Acá importamos NextResponse para devolver respuestas HTTP en formato JSON
import { NextResponse, type NextRequest } from "next/server";
// Acá importamos los adaptadores conSesionApi y manejo estándar de errores HTTP
import { conSesionApi, leerJsonPedido } from "@/lib/adaptadores";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { cambiarContrasena } from "@/servicios/autenticacion";

// Endpoint API PUT/PATCH: recibe datos para modificar un registro existente
export async function PUT(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const cuerpo = await leerJsonPedido(pedido);
    await cambiarContrasena(usuario, cuerpo);
    return new NextResponse(null, { status: 204 });
  });
}
