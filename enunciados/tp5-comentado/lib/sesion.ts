// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Manejo de la sesión con cookie httpOnly firmada con JWT (jose).
// Cumple la sección 10.5: el usuario se resuelve contra la base de datos EN CADA PEDIDO,
// de modo que si se desactiva un usuario con sesión abierta, pierde el acceso al instante.
// [Línea 4] Importa elementos desde 'jose'.
import { SignJWT, jwtVerify } from "jose";
// [Línea 5] Importa elementos desde 'next/headers'.
import { cookies } from "next/headers";
// [Línea 6] Importa elementos desde 'next/navigation'.
import { redirect } from "next/navigation";
// [Línea 7] Importa elementos desde '@/servicios/autenticacion'.
import { buscarUsuarioDeSesion } from "@/servicios/autenticacion";
// [Línea 8] Importa elementos desde '@/servicios/errores'.
import { noAutenticado } from "@/servicios/errores";
// [Línea 9] Importa tipos de TypeScript (solo para chequeo al compilar): import type { UsuarioSesion } from "@/servicios/comunes";
import type { UsuarioSesion } from "@/servicios/comunes";

// [Línea 11] Declara y exporta la constante 'NOMBRE_COOKIE_SESION'.
export const NOMBRE_COOKIE_SESION = "mostrador_sesion";
// [Línea 12] Declara 'DURACION_SEGUNDOS' y le asigna el valor resultante.
const DURACION_SEGUNDOS = 60 * 60 * 24 * 7; // 7 días

// [Línea 14] Declara la función o componente 'obtenerSecreto'.
function obtenerSecreto(): Uint8Array {
  // [Línea 15] Declara 'textoSecreto' y le asigna el valor resultante.
  const textoSecreto =
    // [Línea 16] Ejecuta o evalúa: process.env.SESSION_SECRET ?? "secreto-desarrollo-mostrador-comercial-2026-tup";
    process.env.SESSION_SECRET ?? "secreto-desarrollo-mostrador-comercial-2026-tup";
  // [Línea 17] Devuelve el valor: new TextEncoder().encode(textoSecreto);
  return new TextEncoder().encode(textoSecreto);
// [Línea 18] Cierra el bloque o estructura (}).
}

// Firma un token JWT con el id del usuario.
// [Línea 21] Declara la función asíncrona 'firmarTokenSesion'.
export async function firmarTokenSesion(idUsuario: number): Promise<string> {
  // [Línea 22] Devuelve el valor: new SignJWT({ uid: idUsuario })
  return new SignJWT({ uid: idUsuario })
    // [Línea 23] Ejecuta o evalúa: .setProtectedHeader({ alg: "HS256" })
    .setProtectedHeader({ alg: "HS256" })
    // [Línea 24] Ejecuta o evalúa: .setIssuedAt()
    .setIssuedAt()
    // [Línea 25] Ejecuta o evalúa: .setExpirationTime(`${DURACION_SEGUNDOS}s`)
    .setExpirationTime(`${DURACION_SEGUNDOS}s`)
    // [Línea 26] Ejecuta o evalúa: .sign(obtenerSecreto());
    .sign(obtenerSecreto());
// [Línea 27] Cierra el bloque o estructura (}).
}

// Verifica la firma del token y devuelve el id del usuario (o null si es inválido/vencido).
// [Línea 30] Declara la función asíncrona 'verificarTokenSesion'.
export async function verificarTokenSesion(token: string): Promise<number | null> {
  // [Línea 31] Inicia bloque try para capturar errores durante la operación.
  try {
    // [Línea 32] Espera el resultado de la consulta/operación asíncrona y lo asigna a '{ payload }'.
    const { payload } = await jwtVerify(token, obtenerSecreto());
    // [Línea 33] Declara 'idUsuario' y le asigna el valor resultante.
    const idUsuario = Number(payload.uid);
    // [Línea 34] Devuelve el valor: Number.isInteger(idUsuario) && idUsuario > 0 ? idUsuario : null;
    return Number.isInteger(idUsuario) && idUsuario > 0 ? idUsuario : null;
  // [Línea 35] Captura cualquier error lanzado dentro del bloque try.
  } catch {
    // [Línea 36] Devuelve el valor: null;
    return null;
  // [Línea 37] Cierra el bloque o estructura (}).
  }
// [Línea 38] Cierra el bloque o estructura (}).
}

// Opciones de la cookie de sesión: httpOnly y SameSite=Lax (sección 11.1).
// [Línea 41] Declara la función o componente 'opcionesCookieSesion'.
export function opcionesCookieSesion() {
  // [Línea 42] Devuelve el valor: {
  return {
    // [Línea 43] Define o asigna el campo/parámetro 'httpOnly'.
    httpOnly: true,
    // [Línea 44] Define o asigna el campo/parámetro 'sameSite'.
    sameSite: "lax" as const,
    // [Línea 45] Define o asigna el campo/parámetro 'path'.
    path: "/",
    // [Línea 46] Define o asigna el campo/parámetro 'maxAge'.
    maxAge: DURACION_SEGUNDOS,
    // [Línea 47] Define o asigna el campo/parámetro 'secure'.
    secure: process.env.NODE_ENV === "production",
  // [Línea 48] Cierra el bloque o estructura (};).
  };
// [Línea 49] Cierra el bloque o estructura (}).
}

// Lee la cookie y consulta la base de datos para devolver el usuario activo actual.
// [Línea 52] Declara la función asíncrona 'obtenerUsuarioActual'.
export async function obtenerUsuarioActual(): Promise<UsuarioSesion | null> {
  // [Línea 53] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'almacenCookies'.
  const almacenCookies = await cookies();
  // [Línea 54] Declara 'token' y le asigna el valor resultante.
  const token = almacenCookies.get(NOMBRE_COOKIE_SESION)?.value;
  // [Línea 55] Verifica la condición: if (!token) return null;
  if (!token) return null;

  // [Línea 57] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'idUsuario'.
  const idUsuario = await verificarTokenSesion(token);
  // [Línea 58] Verifica la condición: if (!idUsuario) return null;
  if (!idUsuario) return null;

  // [Línea 60] Devuelve el valor: buscarUsuarioDeSesion(idUsuario);
  return buscarUsuarioDeSesion(idUsuario);
// [Línea 61] Cierra el bloque o estructura (}).
}

// Para los Route Handlers de la API: devuelve el usuario o lanza 401 NO_AUTENTICADO.
// [Línea 64] Declara la función asíncrona 'exigirUsuarioApi'.
export async function exigirUsuarioApi(): Promise<UsuarioSesion> {
  // [Línea 65] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
  const usuario = await obtenerUsuarioActual();
  // [Línea 66] Verifica la condición: if (!usuario) throw noAutenticado();
  if (!usuario) throw noAutenticado();
  // [Línea 67] Devuelve el valor: usuario;
  return usuario;
// [Línea 68] Cierra el bloque o estructura (}).
}

// Para las páginas (Server Components): devuelve el usuario o redirige a /login.
// [Línea 71] Declara la función asíncrona 'exigirUsuarioPagina'.
export async function exigirUsuarioPagina(): Promise<UsuarioSesion> {
  // [Línea 72] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
  const usuario = await obtenerUsuarioActual();
  // [Línea 73] Verifica la condición: if (!usuario) redirect("/login");
  if (!usuario) redirect("/login");
  // [Línea 74] Devuelve el valor: usuario;
  return usuario;
// [Línea 75] Cierra el bloque o estructura (}).
}
