// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// GET y POST /api/productos/{id}/movimientos (RF-P4, RF-P5, RF-P6).
// [Línea 2] Importa elementos desde 'next/server'.
import { NextResponse, type NextRequest } from "next/server";
// [Línea 3] Importa elementos desde '@/lib/adaptadores'.
import { conSesionApi, leerJsonPedido, leerParametrosUrl } from "@/lib/adaptadores";
// [Línea 4] Importa elementos desde '@/servicios/stock'.
import { listarMovimientosDeProducto, registrarMovimientoManual } from "@/servicios/stock";

// [Línea 6] Define el tipo de datos 'ContextoRuta' en TypeScript.
type ContextoRuta = { params: Promise<{ id: string }> };

// [Línea 8] Endpoint de la API REST (Route Handler de Next.js) que atiende peticiones HTTP GET.
export async function GET(pedido: NextRequest, contexto: ContextoRuta) {
  // [Línea 9] Devuelve el valor: conSesionApi(async (usuario) => {
  return conSesionApi(async (usuario) => {
    // [Línea 10] Espera el resultado de la consulta/operación asíncrona y lo asigna a '{ id }'.
    const { id } = await contexto.params;
    // [Línea 11] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'resultado'.
    const resultado = await listarMovimientosDeProducto(
      // [Línea 12] Ejecuta o evalúa: usuario,
      usuario,
      // [Línea 13] Ejecuta o evalúa: Number(id),
      Number(id),
      // [Línea 14] Ejecuta o evalúa: leerParametrosUrl(pedido),
      leerParametrosUrl(pedido),
    // [Línea 15] Cierra el bloque o estructura ();).
    );
    // [Línea 16] Devuelve el valor: NextResponse.json(resultado, { status: 200 });
    return NextResponse.json(resultado, { status: 200 });
  // [Línea 17] Cierra el bloque o estructura (});).
  });
// [Línea 18] Cierra el bloque o estructura (}).
}

// [Línea 20] Endpoint de la API REST (Route Handler de Next.js) que atiende peticiones HTTP POST.
export async function POST(pedido: NextRequest, contexto: ContextoRuta) {
  // [Línea 21] Devuelve el valor: conSesionApi(async (usuario) => {
  return conSesionApi(async (usuario) => {
    // [Línea 22] Espera el resultado de la consulta/operación asíncrona y lo asigna a '{ id }'.
    const { id } = await contexto.params;
    // [Línea 23] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'cuerpo'.
    const cuerpo = await leerJsonPedido(pedido);
    // [Línea 24] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'movimiento'.
    const movimiento = await registrarMovimientoManual(usuario, Number(id), cuerpo);
    // [Línea 25] Devuelve el valor: NextResponse.json(movimiento, { status: 201 });
    return NextResponse.json(movimiento, { status: 201 });
  // [Línea 26] Cierra el bloque o estructura (});).
  });
// [Línea 27] Cierra el bloque o estructura (}).
}
