// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Layout raíz de Next.js App Router.
// [Línea 2] Importa tipos de TypeScript (solo para chequeo al compilar): import type { Metadata } from "next";
import type { Metadata } from "next";
// [Línea 3] Importa elementos desde 'sonner'.
import { Toaster } from "sonner";
// [Línea 4] Inicia un bloque de importación de dependencias.
import "./globals.css";

// [Línea 6] Declara y exporta la constante 'metadata'.
export const metadata: Metadata = {
  // [Línea 7] Define o asigna el campo/parámetro 'title'.
  title: "Ferretería El Yunque · Gestión Comercial",
  // [Línea 8] Define o asigna el campo/parámetro 'description'.
  description: "Sistema de gestión comercial: facturación, control de stock y cuenta corriente",
// [Línea 9] Cierra el bloque o estructura (};).
};

// [Línea 11] Declara la función o componente 'LayoutRaiz'.
export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  // [Línea 12] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <html lang="es"> // [Línea 13] Abre o renderiza el componente visual <html>.
      <body className="antialiased"> // [Línea 14] Abre o renderiza el componente visual <body>.
        // [Línea 15] Ejecuta o evalúa: {children}
        {children}
        <Toaster position="top-right" richColors closeButton /> // [Línea 16] Abre o renderiza el componente visual <Toaster>.
      </body> // [Línea 17] Cierra el componente visual </body>.
    </html> // [Línea 18] Cierra el componente visual </html>.
  // [Línea 19] Cierra el bloque o estructura ();).
  );
// [Línea 20] Cierra el bloque o estructura (}).
}
