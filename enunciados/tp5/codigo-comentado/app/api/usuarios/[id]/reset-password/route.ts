// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// POST /api/usuarios/{id}/reset-password (RF-U5, solo administrador).
// [Línea 2] Importa elementos desde 'next/server'.
import { NextResponse, type NextRequest } from "next/server";
// [Línea 3] Importa elementos desde '@/lib/adaptadores'.
import { conSesionApi } from "@/lib/adaptadores";
// [Línea 4] Importa elementos desde '@/servicios/usuarios'.
import { restablecerContrasena } from "@/servicios/usuarios";

// [Línea 6] Define el tipo de datos 'ContextoRuta' en TypeScript.
type ContextoRuta = { params: Promise<{ id: string }> };

// [Línea 8] Endpoint de la API REST (Route Handler de Next.js) que atiende peticiones HTTP POST.
export async function POST(_pedido: NextRequest, contexto: ContextoRuta) {
  // [Línea 9] Devuelve el valor: conSesionApi(async (usuario) => {
  return conSesionApi(async (usuario) => {
    // [Línea 10] Espera el resultado de la consulta/operación asíncrona y lo asigna a '{ id }'.
    const { id } = await contexto.params;
    // [Línea 11] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'resultado'.
    const resultado = await restablecerContrasena(usuario, Number(id));
    // [Línea 12] Devuelve el valor: NextResponse.json(resultado, { status: 200 });
    return NextResponse.json(resultado, { status: 200 });
  // [Línea 13] Cierra el bloque o estructura (});).
  });
// [Línea 14] Cierra el bloque o estructura (}).
}
