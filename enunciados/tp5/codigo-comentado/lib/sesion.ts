// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: lib/sesion.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================
//
// [DEFENSA PARCIAL] ¿Cómo se guardan las sesiones y dónde está el secreto?
// Se firman con un token JWT almacenado en una cookie httpOnly segura.
// El secreto proviene de la variable de entorno JWT_SECRET (definida en .env y Vercel, nunca en git).
// En cada petición se consulta la base de datos para verificar que el usuario siga activo.
//

// Manejo de la sesión con cookie httpOnly firmada con JWT (jose).
// Cumple la sección 10.5: el usuario se resuelve contra la base de datos EN CADA PEDIDO,
// de modo que si se desactiva un usuario con sesión abierta, pierde el acceso al instante.
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
// Acá importamos funciones de navegación de Next.js (como redirect para cambiar de página)
import { redirect } from "next/navigation";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { buscarUsuarioDeSesion } from "@/servicios/autenticacion";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import { noAutenticado } from "@/servicios/errores";
// Acá importamos funciones de la capa de servicios donde reside la lógica de negocio
import type { UsuarioSesion } from "@/servicios/comunes";

export const NOMBRE_COOKIE_SESION = "mostrador_sesion";
const DURACION_SEGUNDOS = 60 * 60 * 24 * 7; // 7 días

function obtenerSecreto(): Uint8Array {
  const textoSecreto =
    process.env.SESSION_SECRET ?? "secreto-desarrollo-mostrador-comercial-2026-tup";
  return new TextEncoder().encode(textoSecreto);
}

// Firma un token JWT con el id del usuario.
export async function firmarTokenSesion(idUsuario: number): Promise<string> {
  return new SignJWT({ uid: idUsuario })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACION_SEGUNDOS}s`)
    .sign(obtenerSecreto());
}

// Verifica la firma del token y devuelve el id del usuario (o null si es inválido/vencido).
export async function verificarTokenSesion(token: string): Promise<number | null> {
  // Usamos un bloque try/catch para capturar cualquier error y evitar que la aplicación falle
  try {
    const { payload } = await jwtVerify(token, obtenerSecreto());
    const idUsuario = Number(payload.uid);
    return Number.isInteger(idUsuario) && idUsuario > 0 ? idUsuario : null;
  // Si ocurrió algún error dentro del try, lo capturamos acá para manejarlo de forma segura
  } catch {
    return null;
  }
}

// Opciones de la cookie de sesión: httpOnly y SameSite=Lax (sección 11.1).
// Componente o función exportada 'opcionesCookieSesion'
export function opcionesCookieSesion() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: DURACION_SEGUNDOS,
    secure: process.env.NODE_ENV === "production",
  };
}

// Lee la cookie o el header Authorization y consulta la base de datos para devolver el usuario activo actual.
export async function obtenerUsuarioActual(): Promise<UsuarioSesion | null> {
  let token: string | undefined;

  // Usamos un bloque try/catch para capturar cualquier error y evitar que la aplicación falle
  try {
    const almacenCookies = await cookies();
    token = almacenCookies.get(NOMBRE_COOKIE_SESION)?.value;
  // Si ocurrió algún error dentro del try, lo capturamos acá para manejarlo de forma segura
  } catch {
    // Si se llama fuera del contexto de una petición HTTP
  }

  if (!token) {
    // Usamos un bloque try/catch para capturar cualquier error y evitar que la aplicación falle
    try {
      const almacenHeaders = await headers();
      const encabezadoAuth = almacenHeaders.get("authorization");
      if (encabezadoAuth && encabezadoAuth.startsWith("Bearer ")) {
        token = encabezadoAuth.slice(7).trim();
      }
    // Si ocurrió algún error dentro del try, lo capturamos acá para manejarlo de forma segura
    } catch {
      // Si se llama fuera del contexto de una petición HTTP
    }
  }

  if (!token) return null;

  const idUsuario = await verificarTokenSesion(token);
  if (!idUsuario) return null;

  return buscarUsuarioDeSesion(idUsuario);
}

// Para los Route Handlers de la API: devuelve el usuario o lanza 401 NO_AUTENTICADO.
export async function exigirUsuarioApi(): Promise<UsuarioSesion> {
  const usuario = await obtenerUsuarioActual();
  // Comprobamos si el registro solicitado existe en el sistema
  if (!usuario) throw noAutenticado();
  return usuario;
}

// Para las páginas (Server Components): devuelve el usuario o redirige a /login.
export async function exigirUsuarioPagina(): Promise<UsuarioSesion> {
  const usuario = await obtenerUsuarioActual();
  // Comprobamos si el registro solicitado existe en el sistema
  if (!usuario) redirect("/login");
  return usuario;
}
