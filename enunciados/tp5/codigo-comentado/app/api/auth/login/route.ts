// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/api/auth/login/route.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// POST /api/auth/login (RF-U1, única ruta pública).
// Inicia sesión, devuelve el usuario conectado y graba la cookie httpOnly firmada.
// Acá importamos NextResponse para devolver respuestas HTTP en formato JSON
import { NextResponse, type NextRequest } from "next/server";
// Acá importamos los adaptadores conSesionApi y manejo estándar de errores HTTP
import { leerJsonPedido, responderErrorApi } from "@/lib/adaptadores";
// Acá importamos las funciones para leer y validar la sesión del usuario conectado
import { firmarTokenSesion, NOMBRE_COOKIE_SESION, opcionesCookieSesion } from "@/lib/sesion";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { iniciarSesion } from "@/servicios/autenticacion";

// Endpoint API POST: recibe datos del formulario y crea un nuevo registro
export async function POST(pedido: NextRequest) {
  // Usamos un bloque try/catch para capturar cualquier error y evitar que la aplicación falle
  try {
    const cuerpo = await leerJsonPedido(pedido);
    const usuario = await iniciarSesion(cuerpo);
    const token = await firmarTokenSesion(usuario.id);

    const respuesta = NextResponse.json(usuario, { status: 200 });
    respuesta.cookies.set(NOMBRE_COOKIE_SESION, token, opcionesCookieSesion());
    return respuesta;
  // Si ocurrió algún error dentro del try, lo capturamos acá para manejarlo de forma segura
  } catch (errorCapturado) {
    return responderErrorApi(errorCapturado);
  }
}
