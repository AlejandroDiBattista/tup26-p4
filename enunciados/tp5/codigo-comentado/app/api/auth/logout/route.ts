// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// POST /api/auth/logout (RF-U1).
// Cierra la sesión borrando la cookie httpOnly y responde 204.
// [Línea 3] Importa elementos desde 'next/server'.
import { NextResponse } from "next/server";
// [Línea 4] Importa elementos desde '@/lib/adaptadores'.
import { conSesionApi } from "@/lib/adaptadores";
// [Línea 5] Importa elementos desde '@/lib/sesion'.
import { NOMBRE_COOKIE_SESION } from "@/lib/sesion";

// [Línea 7] Endpoint de la API REST (Route Handler de Next.js) que atiende peticiones HTTP POST.
export async function POST() {
  // [Línea 8] Devuelve el valor: conSesionApi(async () => {
  return conSesionApi(async () => {
    // [Línea 9] Declara 'respuesta' y le asigna el valor resultante.
    const respuesta = new NextResponse(null, { status: 204 });
    // [Línea 10] Ejecuta o evalúa: respuesta.cookies.delete(NOMBRE_COOKIE_SESION);
    respuesta.cookies.delete(NOMBRE_COOKIE_SESION);
    // [Línea 11] Devuelve el valor: respuesta;
    return respuesta;
  // [Línea 12] Cierra el bloque o estructura (});).
  });
// [Línea 13] Cierra el bloque o estructura (}).
}
