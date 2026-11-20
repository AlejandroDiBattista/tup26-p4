"use client";
// Campo con etiqueta y mensaje de error, y campo de importe en pesos (sección 10.6).
import * as React from "react";
import { Label } from "@/componentes/ui/label";
import { Input } from "@/componentes/ui/input";
import { Apilar, Caja, Texto } from "@/componentes/primitivas/maquetacion";

export function CampoFormulario({
  etiqueta,
  error,
  ayuda,
  children,
}: {
  etiqueta: string;
  error?: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <Apilar className="gap-1.5">
      <Label>{etiqueta}</Label>
      {children}
      {ayuda && !error && (
        <Texto tamano="xs" tono="suave">
          {ayuda}
        </Texto>
      )}
      {error && (
        <Texto tamano="xs" tono="peligro">
          {error}
        </Texto>
      )}
    </Apilar>
  );
}

// Campo para escribir importes en pesos argentinos (ej. "12500,50").
export function CampoImporte({
  etiqueta,
  valorTexto,
  alCambiar,
  error,
  ayuda,
  placeholder = "0,00",
  disabled,
}: {
  etiqueta: string;
  valorTexto: string;
  alCambiar: (nuevoTexto: string) => void;
  error?: string;
  ayuda?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <CampoFormulario etiqueta={etiqueta} error={error} ayuda={ayuda}>
      <Caja className="relative">
        <Texto
          tono="suave"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 select-none"
        >
          $
        </Texto>
        <Input
          value={valorTexto}
          onChange={(e) => alCambiar(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className="pl-7 font-mono"
        />
      </Caja>
    </CampoFormulario>
  );
}
