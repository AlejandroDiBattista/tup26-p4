// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Primera barrera de protección (sección 10.5):
// En Next.js 16 el archivo "proxy.ts" intercepta las solicitudes antes de llegar a las páginas.
// Si no hay cookie firmada válida y la página no es "/login", redirige a "/login".
// Las rutas "/api/*" responden con JSON 401 directamente desde su adaptador.
// [Línea 5] Importa elementos desde 'next/server'.
import { NextResponse, type NextRequest } from "next/server";
// [Línea 6] Importa elementos desde './lib/sesion'.
import { NOMBRE_COOKIE_SESION, verificarTokenSesion } from "./lib/sesion";

// [Línea 8] Declara la función asíncrona 'proxy'.
export async function proxy(pedido: NextRequest) {
  // [Línea 9] Declara '{ pathname }' y le asigna el valor resultante.
  const { pathname } = pedido.nextUrl;

  // Las rutas de la API y los archivos estáticos se manejan por su cuenta.
  // [Línea 12] Verifica la condición: if (
  if (
    // [Línea 13] Ejecuta o evalúa: pathname.startsWith("/api/") ||
    pathname.startsWith("/api/") ||
    // [Línea 14] Ejecuta o evalúa: pathname.startsWith("/_next/") ||
    pathname.startsWith("/_next/") ||
    // [Línea 15] Ejecuta o evalúa: pathname.includes(".")
    pathname.includes(".")
  // [Línea 16] Ejecuta o evalúa: ) {
  ) {
    // [Línea 17] Devuelve el valor: NextResponse.next();
    return NextResponse.next();
  // [Línea 18] Cierra el bloque o estructura (}).
  }

  // [Línea 20] Declara 'token' y le asigna el valor resultante.
  const token = pedido.cookies.get(NOMBRE_COOKIE_SESION)?.value;
  // [Línea 21] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'idUsuario'.
  const idUsuario = token ? await verificarTokenSesion(token) : null;

  // [Línea 23] Verifica la condición: if (pathname === "/login") {
  if (pathname === "/login") {
    // [Línea 24] Devuelve el valor: NextResponse.next();
    return NextResponse.next();
  // [Línea 25] Cierra el bloque o estructura (}).
  }

  // [Línea 27] Verifica la condición: if (!idUsuario) {
  if (!idUsuario) {
    // [Línea 28] Declara 'urlLogin' y le asigna el valor resultante.
    const urlLogin = new URL("/login", pedido.url);
    // [Línea 29] Devuelve el valor: NextResponse.redirect(urlLogin);
    return NextResponse.redirect(urlLogin);
  // [Línea 30] Cierra el bloque o estructura (}).
  }

  // [Línea 32] Devuelve el valor: NextResponse.next();
  return NextResponse.next();
// [Línea 33] Cierra el bloque o estructura (}).
}

// [Línea 35] Declara y exporta la constante 'config'.
export const config = {
  // [Línea 36] Define o asigna el campo/parámetro 'matcher'.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
// [Línea 37] Cierra el bloque o estructura (};).
};
