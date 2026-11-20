// Primera barrera de protección (sección 10.5):
// En Next.js 16 el archivo "proxy.ts" intercepta las solicitudes antes de llegar a las páginas.
// Si no hay cookie firmada válida y la página no es "/login", redirige a "/login".
// Las rutas "/api/*" responden con JSON 401 directamente desde su adaptador.
import { NextResponse, type NextRequest } from "next/server";
import { NOMBRE_COOKIE_SESION, verificarTokenSesion } from "./lib/sesion";

export async function proxy(pedido: NextRequest) {
  const { pathname } = pedido.nextUrl;

  // Las rutas de la API y los archivos estáticos se manejan por su cuenta.
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = pedido.cookies.get(NOMBRE_COOKIE_SESION)?.value;
  const idUsuario = token ? await verificarTokenSesion(token) : null;

  if (pathname === "/login") {
    return NextResponse.next();
  }

  if (!idUsuario) {
    const urlLogin = new URL("/login", pedido.url);
    return NextResponse.redirect(urlLogin);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
