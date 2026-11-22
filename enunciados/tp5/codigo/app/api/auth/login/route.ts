// POST /api/auth/login (RF-U1, única ruta pública).
// Inicia sesión, devuelve el usuario conectado y graba la cookie httpOnly firmada.
import { NextResponse, type NextRequest } from "next/server";
import { leerJsonPedido, responderErrorApi } from "@/lib/adaptadores";
import { firmarTokenSesion, NOMBRE_COOKIE_SESION, opcionesCookieSesion } from "@/lib/sesion";
import { iniciarSesion } from "@/servicios/autenticacion";

export async function POST(pedido: NextRequest) {
  try {
    const cuerpo = await leerJsonPedido(pedido);
    const usuario = await iniciarSesion(cuerpo);
    const token = await firmarTokenSesion(usuario.id);

    const respuesta = NextResponse.json(usuario, { status: 200 });
    respuesta.cookies.set(NOMBRE_COOKIE_SESION, token, opcionesCookieSesion());
    return respuesta;
  } catch (errorCapturado) {
    return responderErrorApi(errorCapturado);
  }
}
