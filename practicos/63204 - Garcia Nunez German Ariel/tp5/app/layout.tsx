// Layout raíz de Next.js App Router.
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ferretería El Yunque · Gestión Comercial",
  description: "Sistema de gestión comercial: facturación, control de stock y cuenta corriente",
};

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
