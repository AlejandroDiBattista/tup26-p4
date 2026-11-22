// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/api/facturas/[id]/anulacion/route.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// POST /api/facturas/{id}/anulacion (RF-V9, solo administrador).
// Acá importamos NextResponse para devolver respuestas HTTP en formato JSON
import { NextResponse, type NextRequest } from "next/server";
// Acá importamos los adaptadores conSesionApi y manejo estándar de errores HTTP
import { conSesionApi, leerJsonPedido } from "@/lib/adaptadores";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { anularFactura } from "@/servicios/facturas";

type ContextoRuta = { params: Promise<{ id: string }> };

// Endpoint API POST: recibe datos del formulario y crea un nuevo registro
export async function POST(pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const cuerpo = await leerJsonPedido(pedido);
    const facturaAnulada = await anularFactura(usuario, Number(id), cuerpo);
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(facturaAnulada, { status: 200 });
  });
}
