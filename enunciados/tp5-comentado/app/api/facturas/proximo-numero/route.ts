// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// GET /api/facturas/proximo-numero (RF-V1).
// [Línea 2] Importa elementos desde 'next/server'.
import { NextResponse } from "next/server";
// [Línea 3] Importa elementos desde '@/lib/adaptadores'.
import { conSesionApi } from "@/lib/adaptadores";
// [Línea 4] Importa elementos desde '@/servicios/facturas'.
import { obtenerProximoNumeroFactura } from "@/servicios/facturas";

// [Línea 6] Endpoint de la API REST (Route Handler de Next.js) que atiende peticiones HTTP GET.
export async function GET() {
  // [Línea 7] Devuelve el valor: conSesionApi(async (usuario) => {
  return conSesionApi(async (usuario) => {
    // [Línea 8] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'resultado'.
    const resultado = await obtenerProximoNumeroFactura(usuario);
    // [Línea 9] Devuelve el valor: NextResponse.json(resultado, { status: 200 });
    return NextResponse.json(resultado, { status: 200 });
  // [Línea 10] Cierra el bloque o estructura (});).
  });
// [Línea 11] Cierra el bloque o estructura (}).
}
