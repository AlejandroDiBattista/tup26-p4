/* ==========================================================================
   ADAPTADORES DE PETICIONES HTTP Y SERVER ACTIONS (LIB/ADAPTADORES.TS)
   Este módulo actúa como puente entre la web (HTTP / JSON / Server Actions) y los servicios de negocio.
   
   REGLA DE DISEÑO ARQUITECTÓNICO:
   Ninguna ruta de API (route.ts) ni acción de servidor manipula la base de datos directamente
   ni implementa lógica de validación manual. Todas utilizan estos adaptadores para:
   1. Validar la sesión del usuario mediante 'conSesionApi'.
   2. Leer el cuerpo JSON de forma segura mediante 'leerJsonPedido'.
   3. Transformar cualquier error lanzado por los servicios en la respuesta JSON estándar
      { "error": { "code": "...", "message": "...", "details": [...] } } con el código HTTP exacto.
   4. Blindar el servidor contra caídas: Si ocurre un error imprevisto (ej: fallo de hardware o bug),
      se ocultan los detalles internos por seguridad y se devuelve HTTP 500 con código "ERROR_INTERNO".
   ========================================================================== */

/* los import traen herramientas de manejo de peticiones de Next.js y los servicios comunes:
   - NextResponse: constructor de respuestas HTTP en formato JSON
   - NextRequest: tipo que describe la petición HTTP entrante
   - ApiError: clase de error personalizada con código y estado HTTP
   - exigirUsuarioApi: función que extrae el usuario de la sesión o lanza 401
   - UsuarioSesion: tipo con los datos del usuario autenticado */
import { NextResponse, type NextRequest } from "next/server";
import { ApiError } from "@/servicios/errores";
import { exigirUsuarioApi } from "./sesion";
import type { UsuarioSesion } from "@/servicios/comunes";

/* ==========================================================================
   FUNCIÓN: responderErrorApi
   ¿Para qué sirve? Centraliza la respuesta de errores de todas las rutas de API.
   - Si el error es una instancia de ApiError (error conocido de negocio como falta de stock o 404),
     devuelve el código, mensaje y detalles correspondientes con su código de estado HTTP.
   - Si es un error desconocido (TypeError, error de sintaxis, caída de base de datos),
     lo imprime en la consola del servidor con console.error y devuelve un error 500 genérico
     sin exponer información sensible de la infraestructura al cliente.
   ========================================================================== */
export function responderErrorApi(errorCapturado: unknown) {
  /* comprobamos si el error proviene de nuestra clase ApiError */
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

  /* si fue un error no controlado, lo registramos en los logs del servidor para depuración */
  console.error("Error inesperado en la API:", errorCapturado);

  /* devolvemos una respuesta genérica de error 500 */
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

/* ==========================================================================
   FUNCIÓN: leerJsonPedido
   ¿Para qué sirve? Lee y parsea el cuerpo de una petición POST, PUT o PATCH.
   Si el cliente envió un JSON roto o mal formado (ej: comillas sin cerrar),
   en lugar de hacer colapsar el servidor lanza un ApiError 400 controlado ("JSON_INVALIDO").
   ========================================================================== */
export async function leerJsonPedido(pedido: NextRequest | Request): Promise<unknown> {
  try {
    return await pedido.json();
  } catch {
    throw new ApiError(400, "JSON_INVALIDO", "El cuerpo del pedido no es un JSON válido.");
  }
}

/* ==========================================================================
   FUNCIÓN: leerParametrosUrl
   ¿Para qué sirve? Convierte los query parameters de la URL (ej: ?page=1&q=tornillo)
   en un diccionario plano de JavaScript { page: "1", q: "tornillo" }.
   ========================================================================== */
export function leerParametrosUrl(pedido: NextRequest | Request): Record<string, string> {
  const url = new URL(pedido.url);
  return Object.fromEntries(url.searchParams.entries());
}

/* ==========================================================================
   ENVOLTORIO DECORADOR: conSesionApi
   ¿Para qué sirve? Es el middleware de protección para los endpoints de la API (route.ts).
   Recibe una función manejadora que necesita al usuario en sesión.
   1. Ejecuta exigirUsuarioApi() para validar la cookie de sesión.
   2. Si no hay sesión o el usuario está inactivo, corta la ejecución y devuelve 401.
   3. Si la sesión es válida, le inyecta el 'usuario' al manejador y ejecuta la lógica.
   4. Si ocurre cualquier error dentro del manejador, lo atrapa y lo formatea con responderErrorApi.
   ========================================================================== */
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

/* tipo TypeScript para describir el resultado devuelto por una Server Action a un formulario */
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

/* ==========================================================================
   ENVOLTORIO: ejecutarAccion
   ¿Para qué sirve? Similar a conSesionApi pero adaptado para Server Actions de Next.js.
   Envuelve la llamada en un bloque try/catch y devuelve un objeto { ok: true, data }
   o { ok: false, error: { code, message } } para que el hook usarFormulario
   pueda mostrar los errores directamente en los campos del formulario sin recargar la página.
   ========================================================================== */
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
