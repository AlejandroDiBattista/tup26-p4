// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/api/categorias/route.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// GET y POST /api/categorias (RF-P7).
// Acá importamos NextResponse para devolver respuestas HTTP en formato JSON
import { NextResponse, type NextRequest } from "next/server";
// Acá importamos los adaptadores conSesionApi y manejo estándar de errores HTTP
import { conSesionApi, leerJsonPedido, leerParametrosUrl } from "@/lib/adaptadores";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { crearCategoria, listarCategorias } from "@/servicios/categorias";

// Endpoint API GET: atiende peticiones de consulta y devuelve los datos en JSON
export async function GET(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const lista = await listarCategorias(usuario, leerParametrosUrl(pedido));
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(lista, { status: 200 });
  });
}

// Endpoint API POST: recibe datos del formulario y crea un nuevo registro
export async function POST(pedido: NextRequest) {
  return conSesionApi(async (usuario) => {
    const cuerpo = await leerJsonPedido(pedido);
    const categoriaCreada = await crearCategoria(usuario, cuerpo);
    // Retornamos la respuesta HTTP al cliente en formato JSON
    return NextResponse.json(categoriaCreada, { status: 201 });
  });
}
