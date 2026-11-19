// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// PUT /api/auth/password (RF-U5).
// Permite al usuario autenticado cambiar su propia contraseña.
// [Línea 3] Importa elementos desde 'next/server'.
import { NextResponse, type NextRequest } from "next/server";
// [Línea 4] Importa elementos desde '@/lib/adaptadores'.
import { conSesionApi, leerJsonPedido } from "@/lib/adaptadores";
// [Línea 5] Importa elementos desde '@/servicios/autenticacion'.
import { cambiarContrasena } from "@/servicios/autenticacion";

// [Línea 7] Endpoint de la API REST (Route Handler de Next.js) que atiende peticiones HTTP PUT.
export async function PUT(pedido: NextRequest) {
  // [Línea 8] Devuelve el valor: conSesionApi(async (usuario) => {
  return conSesionApi(async (usuario) => {
    // [Línea 9] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'cuerpo'.
    const cuerpo = await leerJsonPedido(pedido);
    // [Línea 10] Espera a que se complete la operación asíncrona: await cambiarContrasena(usuario, cuerpo);
    await cambiarContrasena(usuario, cuerpo);
    // [Línea 11] Devuelve el valor: new NextResponse(null, { status: 204 });
    return new NextResponse(null, { status: 204 });
  // [Línea 12] Cierra el bloque o estructura (});).
  });
// [Línea 13] Cierra el bloque o estructura (}).
}
