// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// POST /api/clientes/{id}/pagos (RF-C5).
// [Línea 2] Importa elementos desde 'next/server'.
import { NextResponse, type NextRequest } from "next/server";
// [Línea 3] Importa elementos desde '@/lib/adaptadores'.
import { conSesionApi, leerJsonPedido } from "@/lib/adaptadores";
// [Línea 4] Importa elementos desde '@/servicios/pagos'.
import { registrarPago } from "@/servicios/pagos";

// [Línea 6] Define el tipo de datos 'ContextoRuta' en TypeScript.
type ContextoRuta = { params: Promise<{ id: string }> };

// [Línea 8] Endpoint de la API REST (Route Handler de Next.js) que atiende peticiones HTTP POST.
export async function POST(pedido: NextRequest, contexto: ContextoRuta) {
  // [Línea 9] Devuelve el valor: conSesionApi(async (usuario) => {
  return conSesionApi(async (usuario) => {
    // [Línea 10] Espera el resultado de la consulta/operación asíncrona y lo asigna a '{ id }'.
    const { id } = await contexto.params;
    // [Línea 11] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'cuerpo'.
    const cuerpo = await leerJsonPedido(pedido);
    // [Línea 12] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'pago'.
    const pago = await registrarPago(usuario, Number(id), cuerpo);
    // [Línea 13] Devuelve el valor: NextResponse.json(pago, { status: 201 });
    return NextResponse.json(pago, { status: 201 });
  // [Línea 14] Cierra el bloque o estructura (});).
  });
// [Línea 15] Cierra el bloque o estructura (}).
}
