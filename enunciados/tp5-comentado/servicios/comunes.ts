// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Funciones comunes a todos los servicios: validar datos y verificar el rol.
// [Línea 2] Importa elementos desde 'zod'.
import { z } from "zod";
// [Línea 3] Importa elementos desde './errores'.
import { ApiError, sinPermiso } from "./errores";

// Usuario que ya inició sesión. Es lo que reciben todos los servicios.
// [Línea 6] Define el tipo de datos 'UsuarioSesion' en TypeScript.
export type UsuarioSesion = {
  // [Línea 7] Define o asigna el campo/parámetro 'id'.
  id: number;
  // [Línea 8] Define o asigna el campo/parámetro 'nombre'.
  nombre: string;
  // [Línea 9] Define o asigna el campo/parámetro 'email'.
  email: string;
  // [Línea 10] Define o asigna el campo/parámetro 'rol'.
  rol: "admin" | "vendedor";
// [Línea 11] Cierra el bloque o estructura (};).
};

// Valida "datosSinValidar" con un esquema de Zod.
// Si hay errores lanza 422 VALIDACION con el detalle de cada campo.
// [Línea 15] Declara la función o componente 'validar'.
export function validar<T>(esquema: z.ZodType<T>, datosSinValidar: unknown): T {
  // [Línea 16] Declara 'resultado' y le asigna el valor resultante.
  const resultado = esquema.safeParse(datosSinValidar);
  // [Línea 17] Verifica la condición: if (resultado.success) return resultado.data;
  if (resultado.success) return resultado.data;

  // [Línea 19] Declara 'detalles' y le asigna el valor resultante.
  const detalles = resultado.error.issues.map((problema) => ({
    // [Línea 20] Define o asigna el campo/parámetro 'campo'.
    campo: problema.path.join(".") || (problema.code === "unrecognized_keys" ? problema.keys.join(",") : ""),
    // [Línea 21] Define o asigna el campo/parámetro 'mensaje'.
    mensaje: problema.message,
  // [Línea 22] Ejecuta o evalúa: }));
  }));
  // [Línea 23] Corta la ejecución y lanza el error: throw new ApiError(422, "VALIDACION", "Hay campos con errores.", detalles);
  throw new ApiError(422, "VALIDACION", "Hay campos con errores.", detalles);
// [Línea 24] Cierra el bloque o estructura (}).
}

// Regla de permisos: solo el administrador puede seguir (sección 3).
// Ocultar un botón NO alcanza: esta verificación es la que realmente protege.
// [Línea 28] Declara la función o componente 'exigirAdmin'.
export function exigirAdmin(usuario: UsuarioSesion) {
  // [Línea 29] Verifica la condición: if (usuario.rol !== "admin") throw sinPermiso();
  if (usuario.rol !== "admin") throw sinPermiso();
// [Línea 30] Cierra el bloque o estructura (}).
}

// Lee "page" y "pageSize" de los parámetros (por defecto 1 y 20, máximo 100).
// [Línea 33] Declara la función o componente 'leerPaginacion'.
export function leerPaginacion(parametros: { page?: unknown; pageSize?: unknown }) {
  // [Línea 34] Declara 'pagina' y le asigna el valor resultante.
  const pagina = Math.max(1, Number(parametros.page) || 1);
  // [Línea 35] Declara 'tamanoPagina' y le asigna el valor resultante.
  const tamanoPagina = Math.min(100, Math.max(1, Number(parametros.pageSize) || 20));
  // [Línea 36] Devuelve el valor: { pagina, tamanoPagina, salto: (pagina - 1) * tamanoPagina };
  return { pagina, tamanoPagina, salto: (pagina - 1) * tamanoPagina };
// [Línea 37] Cierra el bloque o estructura (}).
}

// Arma la respuesta paginada estándar de la API.
// [Línea 40] Declara la función o componente 'respuestaPaginada'.
export function respuestaPaginada<T>(datos: T[], pagina: number, tamanoPagina: number, total: number) {
  // [Línea 41] Devuelve el valor: { data: datos, page: pagina, pageSize: tamanoPagina, total };
  return { data: datos, page: pagina, pageSize: tamanoPagina, total };
// [Línea 42] Cierra el bloque o estructura (}).
}
