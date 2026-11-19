// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/api/facturas/route.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// GET y POST /api/facturas (RF-V1 a RF-V6, RF-V8).
// Acá importamos NextResponse para devolver respuestas HTTP en formato JSON
import { NextResponse, type NextRequest } from "next/server";
// Acá importamos los adaptadores conSesionApi y manejo estándar de errores HTTP
import { conSesionApi, leerJsonPedido, leerParametrosUrl } from "@/lib/adaptadores";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { emitirFactura, listarFacturas } from "@/servicios/facturas";

// Endpoint API GET: atiende peticiones de consulta y devuelve los datos en JSON
export async function GET(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const resultado = await listarFacturas(usuario, leerParametrosUrl(pedido));
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(resultado, { status: 200 });
  });
}

// Endpoint API POST: recibe datos del formulario y crea un nuevo registro
export async function POST(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const cuerpo = await leerJsonPedido(pedido);
    const facturaCreada = await emitirFactura(usuario, cuerpo);
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(facturaCreada, { status: 201 });
  });
}
