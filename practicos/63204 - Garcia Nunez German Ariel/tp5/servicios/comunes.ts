// Funciones comunes a todos los servicios: validar datos y verificar el rol.
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
export function validar<T>(esquema: z.ZodType<T>, datosSinValidar: unknown): T {
  const resultado = esquema.safeParse(datosSinValidar);
  if (resultado.success) return resultado.data;

  const detalles = resultado.error.issues.map((problema) => ({
    campo: problema.path.join(".") || (problema.code === "unrecognized_keys" ? problema.keys.join(",") : ""),
    mensaje: problema.message,
  }));
  throw new ApiError(422, "VALIDACION", "Hay campos con errores.", detalles);
}

// Regla de permisos: solo el administrador puede seguir (sección 3).
// Ocultar un botón NO alcanza: esta verificación es la que realmente protege.
export function exigirAdmin(usuario: UsuarioSesion) {
  if (usuario.rol !== "admin") throw sinPermiso();
}

// Lee "page" y "pageSize" de los parámetros (por defecto 1 y 20, máximo 100).
export function leerPaginacion(parametros: { page?: unknown; pageSize?: unknown }) {
  const pagina = Math.max(1, Number(parametros.page) || 1);
  const tamanoPagina = Math.min(100, Math.max(1, Number(parametros.pageSize) || 20));
  return { pagina, tamanoPagina, salto: (pagina - 1) * tamanoPagina };
}

// Arma la respuesta paginada estándar de la API.
export function respuestaPaginada<T>(datos: T[], pagina: number, tamanoPagina: number, total: number) {
  return { data: datos, page: pagina, pageSize: tamanoPagina, total };
}
