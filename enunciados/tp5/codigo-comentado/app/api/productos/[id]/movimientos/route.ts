// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/api/productos/[id]/movimientos/route.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// GET y POST /api/productos/{id}/movimientos (RF-P4, RF-P5, RF-P6).
// Acá importamos NextResponse para devolver respuestas HTTP en formato JSON
import { NextResponse, type NextRequest } from "next/server";
// Acá importamos los adaptadores conSesionApi y manejo estándar de errores HTTP
import { conSesionApi, leerJsonPedido, leerParametrosUrl } from "@/lib/adaptadores";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { listarMovimientosDeProducto, registrarMovimientoManual } from "@/servicios/stock";

type ContextoRuta = { params: Promise<{ id: string }> };

// Endpoint API GET: atiende peticiones de consulta y devuelve los datos en JSON
export async function GET(pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const resultado = await listarMovimientosDeProducto(
      usuario,
      Number(id),
      leerParametrosUrl(pedido),
    );
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(resultado, { status: 200 });
  });
}

// Endpoint API POST: recibe datos del formulario y crea un nuevo registro
export async function POST(pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const cuerpo = await leerJsonPedido(pedido);
    const movimiento = await registrarMovimientoManual(usuario, Number(id), cuerpo);
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(movimiento, { status: 201 });
  });
}
