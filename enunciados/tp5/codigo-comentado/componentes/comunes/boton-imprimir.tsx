// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: componentes/comunes/boton-imprimir.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Directiva 'use client': indica que este componente tiene interactividad en el navegador
"use client";
// Botón para imprimir comprobantes de factura y recibos de pago.
import { Printer } from "lucide-react";
// Acá importamos componentes visuales de la interfaz de usuario
import { Button } from "@/componentes/ui/button";

// Componente o función exportada 'BotonImprimir'
export function BotonImprimir({ texto = "Imprimir comprobante" }: { texto?: string }) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <Button variant="outline" onClick={() => window.print()} className="no-imprimir">
      <Printer className="size-4" />
      {texto}
    </Button>
  );
}
