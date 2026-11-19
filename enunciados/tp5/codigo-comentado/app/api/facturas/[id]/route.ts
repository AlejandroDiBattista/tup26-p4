// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/api/facturas/[id]/route.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// GET /api/facturas/{id} (RF-V7).
// Acá importamos NextResponse para devolver respuestas HTTP en formato JSON
import { NextResponse, type NextRequest } from "next/server";
// Acá importamos los adaptadores conSesionApi y manejo estándar de errores HTTP
import { conSesionApi } from "@/lib/adaptadores";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { obtenerFactura } from "@/servicios/facturas";

type ContextoRuta = { params: Promise<{ id: string }> };

// Endpoint API GET: atiende peticiones de consulta y devuelve los datos en JSON
export async function GET(_pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const factura = await obtenerFactura(usuario, Number(id));
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(factura, { status: 200 });
  });
}
