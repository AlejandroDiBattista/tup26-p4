// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/layout.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Layout raíz de Next.js App Router.
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ferretería El Yunque · Gestión Comercial",
  description: "Sistema de gestión comercial: facturación, control de stock y cuenta corriente",
};

// Componente principal 'LayoutRaiz'
export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
