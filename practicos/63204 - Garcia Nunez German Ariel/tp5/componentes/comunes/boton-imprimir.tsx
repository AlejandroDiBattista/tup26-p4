"use client";
// Botón para imprimir comprobantes de factura y recibos de pago.
import { Printer } from "lucide-react";
import { Button } from "@/componentes/ui/button";

export function BotonImprimir({ texto = "Imprimir comprobante" }: { texto?: string }) {
  return (
    <Button variant="outline" onClick={() => window.print()} className="no-imprimir">
      <Printer className="size-4" />
      {texto}
    </Button>
  );
}
