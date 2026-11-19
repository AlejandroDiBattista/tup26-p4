// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/api/productos/[id]/route.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// GET y PATCH /api/productos/{id} (RF-P1, RF-P2, RF-P3).
// Acá importamos NextResponse para devolver respuestas HTTP en formato JSON
import { NextResponse, type NextRequest } from "next/server";
// Acá importamos los adaptadores conSesionApi y manejo estándar de errores HTTP
import { conSesionApi, leerJsonPedido } from "@/lib/adaptadores";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { editarProducto, obtenerProducto } from "@/servicios/productos";

type ContextoRuta = { params: Promise<{ id: string }> };

// Endpoint API GET: atiende peticiones de consulta y devuelve los datos en JSON
export async function GET(_pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const producto = await obtenerProducto(usuario, Number(id));
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(producto, { status: 200 });
  });
}

// Endpoint API PUT/PATCH: recibe datos para modificar un registro existente
export async function PATCH(pedido: NextRequest, contexto: ContextoRuta) {
  return conSesionApi(async (usuario) => {
    const { id } = await contexto.params;
    const cuerpo = await leerJsonPedido(pedido);
    const productoEditado = await editarProducto(usuario, Number(id), cuerpo);
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(productoEditado, { status: 200 });
  });
}
