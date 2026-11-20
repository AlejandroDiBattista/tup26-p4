// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: servicios/comunes.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Funciones comunes a todos los servicios: validar datos y verificar el rol.
// Acá importamos Zod para crear esquemas de validación de datos en formularios y APIs
import { z } from "zod";
import { ApiError, sinPermiso } from "./errores";

// Usuario que ya inició sesión. Es lo que reciben todos los servicios.
export type UsuarioSesion = {
  id: number;
  nombre: string;
  email: string;
  rol: "admin" | "vendedor";
};

// Valida "datosSinValidar" con un esquema de Zod.
// Si hay errores lanza 422 VALIDACION con el detalle de cada campo.
// Componente o función exportada 'validar'
export function validar<T>(esquema: z.ZodType<T>, datosSinValidar: unknown): T {
  const resultado = esquema.safeParse(datosSinValidar);
  if (resultado.success) return resultado.data;

  const detalles = resultado.error.issues.map((problema) => ({
    campo: problema.path.join(".") || (problema.code === "unrecognized_keys" ? problema.keys.join(",") : ""),
    mensaje: problema.message,
  }));
  // Lanzamos un error controlado con código de estado HTTP y mensaje explicativo
  throw new ApiError(422, "VALIDACION", "Hay campos con errores.", detalles);
}

// Regla de permisos: solo el administrador puede seguir (sección 3).
// Ocultar un botón NO alcanza: esta verificación es la que realmente protege.
// Componente o función exportada 'exigirAdmin'
export function exigirAdmin(usuario: UsuarioSesion) {
  // Verificamos si el usuario tiene el rol y permisos requeridos para esta acción
  if (usuario.rol !== "admin") throw sinPermiso();
}

// Lee "page" y "pageSize" de los parámetros (por defecto 1 y 20, máximo 100).
// Componente o función exportada 'leerPaginacion'
export function leerPaginacion(parametros: { page?: unknown; pageSize?: unknown }) {
  const pagina = Math.max(1, Number(parametros.page) || 1);
  const tamanoPagina = Math.min(100, Math.max(1, Number(parametros.pageSize) || 20));
  return { pagina, tamanoPagina, salto: (pagina - 1) * tamanoPagina };
}

// Arma la respuesta paginada estándar de la API.
// Componente o función exportada 'respuestaPaginada'
export function respuestaPaginada<T>(datos: T[], pagina: number, tamanoPagina: number, total: number) {
  return { data: datos, page: pagina, pageSize: tamanoPagina, total };
}
