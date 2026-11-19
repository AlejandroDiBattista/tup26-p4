// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Adaptadores comunes para Route Handlers (API REST) y Server Actions (sección 10.3).
// - Ninguna ruta ni acción contiene reglas de negocio: solo llaman al servicio y traducen
//   el resultado o el error al formato estándar de la sección 11.1.
// [Línea 4] Importa elementos desde 'next/server'.
import { NextResponse, type NextRequest } from "next/server";
// [Línea 5] Importa elementos desde '@/servicios/errores'.
import { ApiError } from "@/servicios/errores";
// [Línea 6] Importa elementos desde './sesion'.
import { exigirUsuarioApi } from "./sesion";
// [Línea 7] Importa tipos de TypeScript (solo para chequeo al compilar): import type { UsuarioSesion } from "@/servicios/comunes";
import type { UsuarioSesion } from "@/servicios/comunes";

// Convierte cualquier error en la respuesta JSON estándar de la sección 11.1 y 11.8.
// [Línea 10] Declara la función o componente 'responderErrorApi'.
export function responderErrorApi(errorCapturado: unknown) {
  // [Línea 11] Verifica la condición: if (errorCapturado instanceof ApiError) {
  if (errorCapturado instanceof ApiError) {
    // [Línea 12] Devuelve el valor: NextResponse.json(
    return NextResponse.json(
      // [Línea 13] Ejecuta o evalúa: {
      {
        // [Línea 14] Define o asigna el campo/parámetro 'error'.
        error: {
          // [Línea 15] Define o asigna el campo/parámetro 'code'.
          code: errorCapturado.code,
          // [Línea 16] Define o asigna el campo/parámetro 'message'.
          message: errorCapturado.message,
          // [Línea 17] Ejecuta o evalúa: ...(errorCapturado.details ? { details: errorCapturado.details } : {}),
          ...(errorCapturado.details ? { details: errorCapturado.details } : {}),
        // [Línea 18] Cierra el bloque o estructura (},).
        },
      // [Línea 19] Cierra el bloque o estructura (},).
      },
      // [Línea 20] Ejecuta o evalúa: { status: errorCapturado.status },
      { status: errorCapturado.status },
    // [Línea 21] Cierra el bloque o estructura ();).
    );
  // [Línea 22] Cierra el bloque o estructura (}).
  }
  // Un error inesperado se registra en el servidor y nunca expone detalles internos al cliente.
  // [Línea 24] Ejecuta o evalúa: console.error("Error inesperado en la API:", errorCapturado);
  console.error("Error inesperado en la API:", errorCapturado);
  // [Línea 25] Devuelve el valor: NextResponse.json(
  return NextResponse.json(
    // [Línea 26] Ejecuta o evalúa: {
    {
      // [Línea 27] Define o asigna el campo/parámetro 'error'.
      error: {
        // [Línea 28] Define o asigna el campo/parámetro 'code'.
        code: "ERROR_INTERNO",
        // [Línea 29] Define o asigna el campo/parámetro 'message'.
        message: "Ocurrió un error interno en el servidor.",
      // [Línea 30] Cierra el bloque o estructura (},).
      },
    // [Línea 31] Cierra el bloque o estructura (},).
    },
    // [Línea 32] Ejecuta o evalúa: { status: 500 },
    { status: 500 },
  // [Línea 33] Cierra el bloque o estructura ();).
  );
// [Línea 34] Cierra el bloque o estructura (}).
}

// Lee el cuerpo JSON de un pedido o lanza 400 JSON_INVALIDO si está mal formado.
// [Línea 37] Declara la función asíncrona 'leerJsonPedido'.
export async function leerJsonPedido(pedido: NextRequest | Request): Promise<unknown> {
  // [Línea 38] Inicia bloque try para capturar errores durante la operación.
  try {
    // [Línea 39] Devuelve el valor: await pedido.json();
    return await pedido.json();
  // [Línea 40] Captura cualquier error lanzado dentro del bloque try.
  } catch {
    // [Línea 41] Corta la ejecución y lanza el error: throw new ApiError(400, "JSON_INVALIDO", "El cuerpo del pedido no es un JSON válido.");
    throw new ApiError(400, "JSON_INVALIDO", "El cuerpo del pedido no es un JSON válido.");
  // [Línea 42] Cierra el bloque o estructura (}).
  }
// [Línea 43] Cierra el bloque o estructura (}).
}

// Convierte los query params de la URL en un objeto simple { clave: valor }.
// [Línea 46] Declara la función o componente 'leerParametrosUrl'.
export function leerParametrosUrl(pedido: NextRequest | Request): Record<string, string> {
  // [Línea 47] Declara 'url' y le asigna el valor resultante.
  const url = new URL(pedido.url);
  // [Línea 48] Devuelve el valor: Object.fromEntries(url.searchParams.entries());
  return Object.fromEntries(url.searchParams.entries());
// [Línea 49] Cierra el bloque o estructura (}).
}

// Envoltorio para Route Handlers autenticados: exige sesión, ejecuta el manejador y formatea errores.
// [Línea 52] Declara la función asíncrona 'conSesionApi'.
export async function conSesionApi(
  // [Línea 53] Define o asigna el campo/parámetro 'manejador'.
  manejador: (usuario: UsuarioSesion) => Promise<NextResponse | Response>,
// [Línea 54] Ejecuta o evalúa: ): Promise<NextResponse | Response> {
): Promise<NextResponse | Response> {
  // [Línea 55] Inicia bloque try para capturar errores durante la operación.
  try {
    // [Línea 56] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
    const usuario = await exigirUsuarioApi();
    // [Línea 57] Devuelve el valor: await manejador(usuario);
    return await manejador(usuario);
  // [Línea 58] Captura cualquier error lanzado dentro del bloque try.
  } catch (errorCapturado) {
    // [Línea 59] Devuelve el valor: responderErrorApi(errorCapturado);
    return responderErrorApi(errorCapturado);
  // [Línea 60] Cierra el bloque o estructura (}).
  }
// [Línea 61] Cierra el bloque o estructura (}).
}

// Tipo de respuesta de una Server Action (para formularios).
// [Línea 64] Define el tipo de datos 'ResultadoAccion<T>' en TypeScript.
export type ResultadoAccion<T> =
  // [Línea 65] Ejecuta o evalúa: | { ok: true; data: T }
  | { ok: true; data: T }
  // [Línea 66] Ejecuta o evalúa: | {
  | {
      // [Línea 67] Define o asigna el campo/parámetro 'ok'.
      ok: false;
      // [Línea 68] Define o asigna el campo/parámetro 'error'.
      error: {
        // [Línea 69] Define o asigna el campo/parámetro 'code'.
        code: string;
        // [Línea 70] Define o asigna el campo/parámetro 'message'.
        message: string;
        // [Línea 71] Ejecuta o evalúa: details?: Record<string, unknown>[];
        details?: Record<string, unknown>[];
      // [Línea 72] Cierra el bloque o estructura (};).
      };
    // [Línea 73] Cierra el bloque o estructura (};).
    };

// Envoltorio para Server Actions: devuelve { ok: true, data } o { ok: false, error }.
// [Línea 76] Declara la función asíncrona 'ejecutarAccion'.
export async function ejecutarAccion<T>(
  // [Línea 77] Define o asigna el campo/parámetro 'operacion'.
  operacion: (usuario: UsuarioSesion) => Promise<T>,
// [Línea 78] Ejecuta o evalúa: ): Promise<ResultadoAccion<T>> {
): Promise<ResultadoAccion<T>> {
  // [Línea 79] Inicia bloque try para capturar errores durante la operación.
  try {
    // [Línea 80] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
    const usuario = await exigirUsuarioApi();
    // [Línea 81] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'data'.
    const data = await operacion(usuario);
    // [Línea 82] Devuelve el valor: { ok: true, data };
    return { ok: true, data };
  // [Línea 83] Captura cualquier error lanzado dentro del bloque try.
  } catch (errorCapturado) {
    // [Línea 84] Verifica la condición: if (errorCapturado instanceof ApiError) {
    if (errorCapturado instanceof ApiError) {
      // [Línea 85] Devuelve el valor: {
      return {
        // [Línea 86] Define o asigna el campo/parámetro 'ok'.
        ok: false,
        // [Línea 87] Define o asigna el campo/parámetro 'error'.
        error: {
          // [Línea 88] Define o asigna el campo/parámetro 'code'.
          code: errorCapturado.code,
          // [Línea 89] Define o asigna el campo/parámetro 'message'.
          message: errorCapturado.message,
          // [Línea 90] Define o asigna el campo/parámetro 'details'.
          details: errorCapturado.details,
        // [Línea 91] Cierra el bloque o estructura (},).
        },
      // [Línea 92] Cierra el bloque o estructura (};).
      };
    // [Línea 93] Cierra el bloque o estructura (}).
    }
    // [Línea 94] Ejecuta o evalúa: console.error("Error inesperado en Server Action:", errorCapturado);
    console.error("Error inesperado en Server Action:", errorCapturado);
    // [Línea 95] Devuelve el valor: {
    return {
      // [Línea 96] Define o asigna el campo/parámetro 'ok'.
      ok: false,
      // [Línea 97] Define o asigna el campo/parámetro 'error'.
      error: {
        // [Línea 98] Define o asigna el campo/parámetro 'code'.
        code: "ERROR_INTERNO",
        // [Línea 99] Define o asigna el campo/parámetro 'message'.
        message: "Ocurrió un error inesperado.",
      // [Línea 100] Cierra el bloque o estructura (},).
      },
    // [Línea 101] Cierra el bloque o estructura (};).
    };
  // [Línea 102] Cierra el bloque o estructura (}).
  }
// [Línea 103] Cierra el bloque o estructura (}).
}
