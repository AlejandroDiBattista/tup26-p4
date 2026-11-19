// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Función auxiliar "cn" para combinar clases de Tailwind CSS sin conflictos.
// [Línea 2] Importa elementos desde 'clsx'.
import { clsx, type ClassValue } from "clsx";
// [Línea 3] Importa elementos desde 'tailwind-merge'.
import { twMerge } from "tailwind-merge";

// [Línea 5] Declara la función o componente 'cn'.
export function cn(...clases: ClassValue[]) {
  // [Línea 6] Devuelve el valor: twMerge(clsx(clases));
  return twMerge(clsx(clases));
// [Línea 7] Cierra el bloque o estructura (}).
}
