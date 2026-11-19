// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Configuración de Next.js.
// [Línea 2] Importa tipos de TypeScript (solo para chequeo al compilar): import type { NextConfig } from "next";
import type { NextConfig } from "next";

// [Línea 4] Declara 'configuracion: NextConfig' y le asigna el valor resultante.
const configuracion: NextConfig = {
  // @libsql/client usa módulos nativos: se deja fuera del empaquetado del servidor.
  // [Línea 6] Define o asigna el campo/parámetro 'serverExternalPackages'.
  serverExternalPackages: ["@libsql/client", "libsql"],
// [Línea 7] Cierra el bloque o estructura (};).
};

// [Línea 9] Ejecuta o evalúa: export default configuracion;
export default configuracion;
