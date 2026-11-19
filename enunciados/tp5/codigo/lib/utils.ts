// Función auxiliar "cn" para combinar clases de Tailwind CSS sin conflictos.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...clases: ClassValue[]) {
  return twMerge(clsx(clases));
}
