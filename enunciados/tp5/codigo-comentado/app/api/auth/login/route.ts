// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// POST /api/auth/login (RF-U1, única ruta pública).
// Inicia sesión, devuelve el usuario conectado y graba la cookie httpOnly firmada.
// [Línea 3] Importa elementos desde 'next/server'.
import { NextResponse, type NextRequest } from "next/server";
// [Línea 4] Importa elementos desde '@/lib/adaptadores'.
import { leerJsonPedido, responderErrorApi } from "@/lib/adaptadores";
// [Línea 5] Importa elementos desde '@/lib/sesion'.
import { firmarTokenSesion, NOMBRE_COOKIE_SESION, opcionesCookieSesion } from "@/lib/sesion";
// [Línea 6] Importa elementos desde '@/servicios/autenticacion'.
import { iniciarSesion } from "@/servicios/autenticacion";

// [Línea 8] Endpoint de la API REST (Route Handler de Next.js) que atiende peticiones HTTP POST.
export async function POST(pedido: NextRequest) {
  // [Línea 9] Inicia bloque try para capturar errores durante la operación.
  try {
    // [Línea 10] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'cuerpo'.
    const cuerpo = await leerJsonPedido(pedido);
    // [Línea 11] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
    const usuario = await iniciarSesion(cuerpo);
    // [Línea 12] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'token'.
    const token = await firmarTokenSesion(usuario.id);

    // [Línea 14] Declara 'respuesta' y le asigna el valor resultante.
    const respuesta = NextResponse.json(usuario, { status: 200 });
    // [Línea 15] Ejecuta o evalúa: respuesta.cookies.set(NOMBRE_COOKIE_SESION, token, opcionesCookieSesion());
    respuesta.cookies.set(NOMBRE_COOKIE_SESION, token, opcionesCookieSesion());
    // [Línea 16] Devuelve el valor: respuesta;
    return respuesta;
  // [Línea 17] Captura cualquier error lanzado dentro del bloque try.
  } catch (errorCapturado) {
    // [Línea 18] Devuelve el valor: responderErrorApi(errorCapturado);
    return responderErrorApi(errorCapturado);
  // [Línea 19] Cierra el bloque o estructura (}).
  }
// [Línea 20] Cierra el bloque o estructura (}).
}
