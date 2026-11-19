// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/api/productos/route.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// GET y POST /api/productos (RF-P1 y RF-P2).
// Acá importamos NextResponse para devolver respuestas HTTP en formato JSON
import { NextResponse, type NextRequest } from "next/server";
// Acá importamos los adaptadores conSesionApi y manejo estándar de errores HTTP
import { conSesionApi, leerJsonPedido, leerParametrosUrl } from "@/lib/adaptadores";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { crearProducto, listarProductos } from "@/servicios/productos";

// Endpoint API GET: atiende peticiones de consulta y devuelve los datos en JSON
export async function GET(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const resultado = await listarProductos(usuario, leerParametrosUrl(pedido));
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(resultado, { status: 200 });
  });
}

// Endpoint API POST: recibe datos del formulario y crea un nuevo registro
export async function POST(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const cuerpo = await leerJsonPedido(pedido);
    const productoCreado = await crearProducto(usuario, cuerpo);
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(productoCreado, { status: 201 });
  });
}
