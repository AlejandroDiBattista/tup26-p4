// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// POST /api/facturas/{id}/anulacion (RF-V9, solo administrador).
// [Línea 2] Importa elementos desde 'next/server'.
import { NextResponse, type NextRequest } from "next/server";
// [Línea 3] Importa elementos desde '@/lib/adaptadores'.
import { conSesionApi, leerJsonPedido } from "@/lib/adaptadores";
// [Línea 4] Importa elementos desde '@/servicios/facturas'.
import { anularFactura } from "@/servicios/facturas";

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
    // [Línea 12] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'facturaAnulada'.
    const facturaAnulada = await anularFactura(usuario, Number(id), cuerpo);
    // [Línea 13] Devuelve el valor: NextResponse.json(facturaAnulada, { status: 200 });
    return NextResponse.json(facturaAnulada, { status: 200 });
  // [Línea 14] Cierra el bloque o estructura (});).
  });
// [Línea 15] Cierra el bloque o estructura (}).
}
