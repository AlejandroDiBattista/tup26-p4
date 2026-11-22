// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/api/usuarios/[id]/reset-password/route.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// POST /api/usuarios/{id}/reset-password (RF-U5, solo administrador).
// Acá importamos NextResponse para devolver respuestas HTTP en formato JSON
import { NextResponse, type NextRequest } from "next/server";
// Acá importamos los adaptadores conSesionApi y manejo estándar de errores HTTP
import { conSesionApi } from "@/lib/adaptadores";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { restablecerContrasena } from "@/servicios/usuarios";

type ContextoRuta = { params: Promise<{ id: string }> };

// Endpoint API POST: recibe datos del formulario y crea un nuevo registro
export async function POST(_pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const resultado = await restablecerContrasena(usuario, Number(id));
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(resultado, { status: 200 });
  });
}
