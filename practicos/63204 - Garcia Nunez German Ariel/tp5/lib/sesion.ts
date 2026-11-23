/* ==========================================================================
   GESTIÓN DE SESIONES, COOKIES HTTPONLY Y TOKENS JWT (LIB/SESION.TS)
   Este módulo es el responsable de la seguridad de acceso a todo el sistema.
   
   PRINCIPIOS DE SEGURIDAD CLAVE:
   1. Cookie httpOnly y SameSite=Lax: La cookie de sesión jamás puede ser leída ni modificada
      por JavaScript en el navegador, bloqueando por completo ataques de XSS (Cross-Site Scripting).
   2. Token JWT firmado con HMAC-SHA256 (librería 'jose'): El payload contiene únicamente el uid
      (identificador del usuario) y una fecha de expiración fija (7 días).
   3. Doble barrera de seguridad en cada petición (sección 10.5):
      Tener la cookie válida NO alcanza. Cada vez que el usuario navega o llama a la API,
      la función obtenerUsuarioActual() consulta a la base de datos para confirmar que el usuario
      siga existiendo y continúe en estado 'activo = true'. Si el empleado fue despedido o dado de baja,
      su acceso queda revocado de forma inmediata en el próximo clic.
   ========================================================================== */

/* los import traen herramientas de criptografía de tokens y funciones nativas de Next.js:
   - SignJWT: clase de 'jose' para firmar y crear tokens JWT
   - jwtVerify: función de 'jose' para descifrar y comprobar la validez de la firma del token
   - cookies: función asíncrona de Next.js para leer cookies del navegador en el servidor
   - headers: función asíncrona de Next.js para inspeccionar los encabezados HTTP de la petición
   - redirect: función de Next.js para redirigir automáticamente al usuario
   - buscarUsuarioDeSesion: consulta a la tabla usuarios en la base de datos
   - noAutenticado: error HTTP 401 si no hay sesión válida
   - UsuarioSesion: tipo con la forma del usuario autenticado */
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { buscarUsuarioDeSesion } from "@/servicios/autenticacion";
import { noAutenticado } from "@/servicios/errores";
import type { UsuarioSesion } from "@/servicios/comunes";

/* nombre oficial de la cookie donde se almacena el token firmado */
export const NOMBRE_COOKIE_SESION = "mostrador_sesion";

/* duración máxima de la sesión: 7 días expresados en segundos (60s * 60m * 24h * 7d = 604.800 segundos) */
const DURACION_SEGUNDOS = 60 * 60 * 24 * 7;

/* ==========================================================================
   FUNCIÓN INTERNA: obtenerSecreto
   ¿Para qué sirve? Obtiene la clave secreta utilizada para firmar los tokens JWT.
   Lee la variable de entorno SESSION_SECRET del archivo .env y la codifica como un arreglo de bytes (Uint8Array).
   Si no existe la variable, usa una clave de desarrollo por defecto.
   ========================================================================== */
function obtenerSecreto(): Uint8Array {
  const textoSecreto =
    process.env.SESSION_SECRET ?? "secreto-desarrollo-mostrador-comercial-2026-tup";
  return new TextEncoder().encode(textoSecreto);
}

/* ==========================================================================
   FUNCIÓN: firmarTokenSesion
   ¿Para qué sirve? Genera un nuevo token JWT firmado cuando el usuario inicia sesión.
   - uid: identificador numérico único del usuario
   - HS256: algoritmo de firma simétrica HMAC con SHA-256
   - setIssuedAt: fija la fecha y hora de emisión
   - setExpirationTime: fija el vencimiento a 7 días
   ========================================================================== */
export async function firmarTokenSesion(idUsuario: number): Promise<string> {
  return new SignJWT({ uid: idUsuario })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACION_SEGUNDOS}s`)
    .sign(obtenerSecreto());
}

/* ==========================================================================
   FUNCIÓN: verificarTokenSesion
   ¿Para qué sirve? Comprueba que el token JWT no haya sido adulterado y que no esté vencido.
   Si la firma es correcta, extrae y devuelve el id del usuario (uid) como número entero.
   Si el token fue manipulado o ya expiró, captura la excepción y devuelve null de forma segura.
   ========================================================================== */
export async function verificarTokenSesion(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, obtenerSecreto());
    const idUsuario = Number(payload.uid);
    return Number.isInteger(idUsuario) && idUsuario > 0 ? idUsuario : null;
  } catch {
    return null;
  }
}

/* ==========================================================================
   FUNCIÓN: opcionesCookieSesion
   ¿Para qué sirve? Define los atributos de seguridad de la cookie enviada en el encabezado Set-Cookie:
   - httpOnly: true -> prohíbe que scripts del navegador lean la cookie (anti-XSS).
   - sameSite: "lax" -> previene ataques CSRF permitiendo navegación segura entre páginas.
   - path: "/" -> la cookie es válida para todas las rutas del sistema.
   - maxAge: tiempo de vida en segundos.
   - secure: en producción exige HTTPS de forma obligatoria.
   ========================================================================== */
export function opcionesCookieSesion() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: DURACION_SEGUNDOS,
    secure: process.env.NODE_ENV === "production",
  };
}

/* ==========================================================================
   FUNCIÓN PRINCIPAL: obtenerUsuarioActual
   ¿Para qué sirve? Es el núcleo de la autenticación en el servidor.
   1. Intenta leer el token desde la cookie 'mostrador_sesion'.
   2. Si no hay cookie, intenta leer el encabezado 'Authorization: Bearer <token>'.
   3. Verifica la firma del token criptográfico.
   4. Consulta la base de datos con buscarUsuarioDeSesion(id) para corroborar que el usuario
      siga existiendo y esté activo.
   Devuelve los datos del usuario en sesión o null si no está autenticado.
   ========================================================================== */
export async function obtenerUsuarioActual(): Promise<UsuarioSesion | null> {
  let token: string | undefined;

  /* 1. Intentamos leer la cookie desde el almacén de cookies de Next.js */
  try {
    const almacenCookies = await cookies();
    token = almacenCookies.get(NOMBRE_COOKIE_SESION)?.value;
  } catch {
    // Si se llama fuera de un contexto de petición HTTP ignoramos el error
  }

  /* 2. Si no vino por cookie, intentamos leer el encabezado Authorization */
  if (!token) {
    try {
      const almacenHeaders = await headers();
      const encabezadoAuth = almacenHeaders.get("authorization");
      if (encabezadoAuth && encabezadoAuth.startsWith("Bearer ")) {
        token = encabezadoAuth.slice(7).trim();
      }
    } catch {
      // Ignoramos si se llama fuera de contexto
    }
  }

  /* si no encontramos ningún token, devolvemos null (no hay sesión) */
  if (!token) return null;

  /* 3. Verificamos la firma criptográfica del token */
  const idUsuario = await verificarTokenSesion(token);
  if (!idUsuario) return null;

  /* 4. Buscamos el usuario en la base de datos en tiempo real (segunda barrera de seguridad) */
  return buscarUsuarioDeSesion(idUsuario);
}

/* ==========================================================================
   FUNCIÓN: exigirUsuarioApi
   ¿Para qué sirve? Se utiliza en los Route Handlers de la API (app/api/.../route.ts).
   Si hay un usuario autenticado y activo lo devuelve; si no, lanza una excepción
   ApiError(401, "NO_AUTENTICADO") que el adaptador traduce en respuesta HTTP 401.
   ========================================================================== */
export async function exigirUsuarioApi(): Promise<UsuarioSesion> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) throw noAutenticado();
  return usuario;
}

/* ==========================================================================
   FUNCIÓN: exigirUsuarioPagina
   ¿Para qué sirve? Se utiliza en las pantallas Server Components (app/(sistema)/.../page.tsx).
   Si el usuario no tiene sesión o fue dado de baja, redirige al instante al usuario
   hacia la pantalla de login (/login) sin renderizar ningún dato sensible.
   ========================================================================== */
export async function exigirUsuarioPagina(): Promise<UsuarioSesion> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/login");
  return usuario;
}
