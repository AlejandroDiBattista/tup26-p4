// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// GET y POST /api/categorias (RF-P7).
// [Línea 2] Importa elementos desde 'next/server'.
import { NextResponse, type NextRequest } from "next/server";
// [Línea 3] Importa elementos desde '@/lib/adaptadores'.
import { conSesionApi, leerJsonPedido, leerParametrosUrl } from "@/lib/adaptadores";
// [Línea 4] Importa elementos desde '@/servicios/categorias'.
import { crearCategoria, listarCategorias } from "@/servicios/categorias";

// [Línea 6] Endpoint de la API REST (Route Handler de Next.js) que atiende peticiones HTTP GET.
export async function GET(pedido: NextRequest) {
  // [Línea 7] Devuelve el valor: conSesionApi(async (usuario) => {
  return conSesionApi(async (usuario) => {
    // [Línea 8] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'lista'.
    const lista = await listarCategorias(usuario, leerParametrosUrl(pedido));
    // [Línea 9] Devuelve el valor: NextResponse.json(lista, { status: 200 });
    return NextResponse.json(lista, { status: 200 });
  // [Línea 10] Cierra el bloque o estructura (});).
  });
// [Línea 11] Cierra el bloque o estructura (}).
}

// [Línea 13] Endpoint de la API REST (Route Handler de Next.js) que atiende peticiones HTTP POST.
export async function POST(pedido: NextRequest) {
  // [Línea 14] Devuelve el valor: conSesionApi(async (usuario) => {
  return conSesionApi(async (usuario) => {
    // [Línea 15] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'cuerpo'.
    const cuerpo = await leerJsonPedido(pedido);
    // [Línea 16] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'categoriaCreada'.
    const categoriaCreada = await crearCategoria(usuario, cuerpo);
    // [Línea 17] Devuelve el valor: NextResponse.json(categoriaCreada, { status: 201 });
    return NextResponse.json(categoriaCreada, { status: 201 });
  // [Línea 18] Cierra el bloque o estructura (});).
  });
// [Línea 19] Cierra el bloque o estructura (}).
}
