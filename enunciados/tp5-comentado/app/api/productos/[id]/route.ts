// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// GET y PATCH /api/productos/{id} (RF-P1, RF-P2, RF-P3).
// [Línea 2] Importa elementos desde 'next/server'.
import { NextResponse, type NextRequest } from "next/server";
// [Línea 3] Importa elementos desde '@/lib/adaptadores'.
import { conSesionApi, leerJsonPedido } from "@/lib/adaptadores";
// [Línea 4] Importa elementos desde '@/servicios/productos'.
import { editarProducto, obtenerProducto } from "@/servicios/productos";

// [Línea 6] Define el tipo de datos 'ContextoRuta' en TypeScript.
type ContextoRuta = { params: Promise<{ id: string }> };

// [Línea 8] Endpoint de la API REST (Route Handler de Next.js) que atiende peticiones HTTP GET.
export async function GET(_pedido: NextRequest, contexto: ContextoRuta) {
  // [Línea 9] Devuelve el valor: conSesionApi(async (usuario) => {
  return conSesionApi(async (usuario) => {
    // [Línea 10] Espera el resultado de la consulta/operación asíncrona y lo asigna a '{ id }'.
    const { id } = await contexto.params;
    // [Línea 11] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'producto'.
    const producto = await obtenerProducto(usuario, Number(id));
    // [Línea 12] Devuelve el valor: NextResponse.json(producto, { status: 200 });
    return NextResponse.json(producto, { status: 200 });
  // [Línea 13] Cierra el bloque o estructura (});).
  });
// [Línea 14] Cierra el bloque o estructura (}).
}

// [Línea 16] Endpoint de la API REST (Route Handler de Next.js) que atiende peticiones HTTP PATCH.
export async function PATCH(pedido: NextRequest, contexto: ContextoRuta) {
  // [Línea 17] Devuelve el valor: conSesionApi(async (usuario) => {
  return conSesionApi(async (usuario) => {
    // [Línea 18] Espera el resultado de la consulta/operación asíncrona y lo asigna a '{ id }'.
    const { id } = await contexto.params;
    // [Línea 19] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'cuerpo'.
    const cuerpo = await leerJsonPedido(pedido);
    // [Línea 20] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'productoEditado'.
    const productoEditado = await editarProducto(usuario, Number(id), cuerpo);
    // [Línea 21] Devuelve el valor: NextResponse.json(productoEditado, { status: 200 });
    return NextResponse.json(productoEditado, { status: 200 });
  // [Línea 22] Cierra el bloque o estructura (});).
  });
// [Línea 23] Cierra el bloque o estructura (}).
}
