// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// GET /api/facturas/{id} (RF-V7).
// [Línea 2] Importa elementos desde 'next/server'.
import { NextResponse, type NextRequest } from "next/server";
// [Línea 3] Importa elementos desde '@/lib/adaptadores'.
import { conSesionApi } from "@/lib/adaptadores";
// [Línea 4] Importa elementos desde '@/servicios/facturas'.
import { obtenerFactura } from "@/servicios/facturas";

// [Línea 6] Define el tipo de datos 'ContextoRuta' en TypeScript.
type ContextoRuta = { params: Promise<{ id: string }> };

// [Línea 8] Endpoint de la API REST (Route Handler de Next.js) que atiende peticiones HTTP GET.
export async function GET(_pedido: NextRequest, contexto: ContextoRuta) {
  // [Línea 9] Devuelve el valor: conSesionApi(async (usuario) => {
  return conSesionApi(async (usuario) => {
    // [Línea 10] Espera el resultado de la consulta/operación asíncrona y lo asigna a '{ id }'.
    const { id } = await contexto.params;
    // [Línea 11] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'factura'.
    const factura = await obtenerFactura(usuario, Number(id));
    // [Línea 12] Devuelve el valor: NextResponse.json(factura, { status: 200 });
    return NextResponse.json(factura, { status: 200 });
  // [Línea 13] Cierra el bloque o estructura (});).
  });
// [Línea 14] Cierra el bloque o estructura (}).
}
