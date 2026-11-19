// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// [Línea 1] Directiva de Next.js: marca este archivo como Client Component (se ejecuta en el navegador con estado e interactividad).
"use client";
// Botón para imprimir comprobantes de factura y recibos de pago.
// [Línea 3] Importa elementos desde 'lucide-react'.
import { Printer } from "lucide-react";
// [Línea 4] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";

// [Línea 6] Declara la función o componente 'BotonImprimir'.
export function BotonImprimir({ texto = "Imprimir comprobante" }: { texto?: string }) {
  // [Línea 7] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Button variant="outline" onClick={() => window.print()} className="no-imprimir"> // [Línea 8] Abre o renderiza el componente visual <Button>.
      <Printer className="size-4" /> // [Línea 9] Abre o renderiza el componente visual <Printer>.
      // [Línea 10] Ejecuta o evalúa: {texto}
      {texto}
    </Button> // [Línea 11] Cierra el componente visual </Button>.
  // [Línea 12] Cierra el bloque o estructura ();).
  );
// [Línea 13] Cierra el bloque o estructura (}).
}
