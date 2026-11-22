// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: componentes/dominio/formulario-perfil.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Directiva 'use client': indica que este componente tiene interactividad en el navegador
"use client";
// Formulario para que cada usuario cambie su propia contraseña desde /perfil (RF-U5).
import { useState } from "react";
import { KeyRound } from "lucide-react";
import { accionCambiarContrasena } from "@/acciones/comercial";
// Acá importamos esquemas de validación
import { esquemaCambioContrasena } from "@/esquemas/usuarios";
import { usarFormulario } from "@/hooks/usar-formulario";
// Acá importamos componentes visuales de la interfaz de usuario
import { Button } from "@/componentes/ui/button";
// Acá importamos componentes visuales de la interfaz de usuario
import { Input } from "@/componentes/ui/input";
// Acá importamos componentes visuales de la interfaz de usuario
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
// Acá importamos componentes visuales de la interfaz de usuario
import { CampoFormulario } from "@/componentes/comunes/campo-formulario";

// Componente o función exportada 'FormularioCambiarContrasena'
export function FormularioCambiarContrasena() {
  // Definimos una variable de estado React 'claveActual' para controlar la interfaz
  const [claveActual, setClaveActual] = useState("");
  // Definimos una variable de estado React 'claveNueva' para controlar la interfaz
  const [claveNueva, setClaveNueva] = useState("");

  const { errores, enviando, enviar } = usarFormulario({
    esquema: esquemaCambioContrasena,
    accion: (datos) => accionCambiarContrasena(datos),
    mensajeExito: "Tu contraseña se actualizó correctamente",
    alTerminar: () => {
      setClaveActual("");
      setClaveNueva("");
    },
  });

  function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    enviar({ actual: claveActual, nueva: claveNueva });
  }

  // Renderizamos la interfaz visual de este componente:
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Cambiar contraseña</CardTitle>
        <CardDescription>
          Ingresá tu contraseña actual y definí una nueva de al menos 8 caracteres.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
          <CampoFormulario etiqueta="Contraseña actual" error={errores.actual}>
            <Input
              type="password"
              value={claveActual}
              onChange={(e) => setClaveActual(e.target.value)}
              placeholder="••••••••"
            />
          </CampoFormulario>

          <CampoFormulario
            etiqueta="Nueva contraseña"
            error={errores.nueva}
            ayuda="Debe tener como mínimo 8 caracteres."
          >
            <Input
              type="password"
              value={claveNueva}
              onChange={(e) => setClaveNueva(e.target.value)}
              placeholder="••••••••"
            />
          </CampoFormulario>

          <Button type="submit" disabled={enviando} className="self-start">
            <KeyRound className="size-4" />
            {enviando ? "Actualizando..." : "Actualizar contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
