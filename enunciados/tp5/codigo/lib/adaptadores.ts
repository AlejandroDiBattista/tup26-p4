// Adaptadores comunes para Route Handlers (API REST) y Server Actions (sección 10.3).
// - Ninguna ruta ni acción contiene reglas de negocio: solo llaman al servicio y traducen
//   el resultado o el error al formato estándar de la sección 11.1.
import { NextResponse, type NextRequest } from "next/server";
import { ApiError } from "@/servicios/errores";
import { exigirUsuarioApi } from "./sesion";
import type { UsuarioSesion } from "@/servicios/comunes";

// Convierte cualquier error en la respuesta JSON estándar de la sección 11.1 y 11.8.
export function responderErrorApi(errorCapturado: unknown) {
  if (errorCapturado instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: errorCapturado.code,
          message: errorCapturado.message,
          ...(errorCapturado.details ? { details: errorCapturado.details } : {}),
        },
      },
      { status: errorCapturado.status },
    );
  }
  // Un error inesperado se registra en el servidor y nunca expone detalles internos al cliente.
  console.error("Error inesperado en la API:", errorCapturado);
  return NextResponse.json(
    {
      error: {
        code: "ERROR_INTERNO",
        message: "Ocurrió un error interno en el servidor.",
      },
    },
    { status: 500 },
  );
}

// Lee el cuerpo JSON de un pedido o lanza 400 JSON_INVALIDO si está mal formado.
export async function leerJsonPedido(pedido: NextRequest | Request): Promise<unknown> {
  try {
    return await pedido.json();
  } catch {
    throw new ApiError(400, "JSON_INVALIDO", "El cuerpo del pedido no es un JSON válido.");
  }
}

// Convierte los query params de la URL en un objeto simple { clave: valor }.
export function leerParametrosUrl(pedido: NextRequest | Request): Record<string, string> {
  const url = new URL(pedido.url);
  return Object.fromEntries(url.searchParams.entries());
}

// Envoltorio para Route Handlers autenticados: exige sesión, ejecuta el manejador y formatea errores.
export async function conSesionApi(
  manejador: (usuario: UsuarioSesion) => Promise<NextResponse | Response>,
): Promise<NextResponse | Response> {
  try {
    const usuario = await exigirUsuarioApi();
    return await manejador(usuario);
  } catch (errorCapturado) {
    return responderErrorApi(errorCapturado);
  }
}

// Tipo de respuesta de una Server Action (para formularios).
export type ResultadoAccion<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
        details?: Record<string, unknown>[];
      };
    };

// Envoltorio para Server Actions: devuelve { ok: true, data } o { ok: false, error }.
export async function ejecutarAccion<T>(
  operacion: (usuario: UsuarioSesion) => Promise<T>,
): Promise<ResultadoAccion<T>> {
  try {
    const usuario = await exigirUsuarioApi();
    const data = await operacion(usuario);
    return { ok: true, data };
  } catch (errorCapturado) {
    if (errorCapturado instanceof ApiError) {
      return {
        ok: false,
        error: {
          code: errorCapturado.code,
          message: errorCapturado.message,
          details: errorCapturado.details,
        },
      };
    }
    console.error("Error inesperado en Server Action:", errorCapturado);
    return {
      ok: false,
      error: {
        code: "ERROR_INTERNO",
        message: "Ocurrió un error inesperado.",
      },
    };
  }
}
