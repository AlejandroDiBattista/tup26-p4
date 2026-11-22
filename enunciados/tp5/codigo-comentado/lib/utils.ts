// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: lib/utils.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Función auxiliar "cn" para combinar clases de Tailwind CSS sin conflictos.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Componente o función exportada 'cn'
export function cn(...clases: ClassValue[]) {
  return twMerge(clsx(clases));
}
