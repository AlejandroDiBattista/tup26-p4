// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/api/usuarios/[id]/route.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// PATCH /api/usuarios/{id} (RF-U4, solo administrador).
// Acá importamos NextResponse para devolver respuestas HTTP en formato JSON
import { NextResponse, type NextRequest } from "next/server";
// Acá importamos los adaptadores conSesionApi y manejo estándar de errores HTTP
import { conSesionApi, leerJsonPedido } from "@/lib/adaptadores";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { editarUsuario } from "@/servicios/usuarios";

type ContextoRuta = { params: Promise<{ id: string }> };

// Endpoint API PUT/PATCH: recibe datos para modificar un registro existente
export async function PATCH(pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const cuerpo = await leerJsonPedido(pedido);
    const usuarioActualizado = await editarUsuario(usuario, Number(id), cuerpo);
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(usuarioActualizado, { status: 200 });
  });
}
