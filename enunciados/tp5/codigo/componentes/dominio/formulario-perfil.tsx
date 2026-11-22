"use client";
// Formulario para que cada usuario cambie su propia contraseña desde /perfil (RF-U5).
import { useState } from "react";
import { KeyRound } from "lucide-react";
import { accionCambiarContrasena } from "@/acciones/comercial";
import { esquemaCambioContrasena } from "@/esquemas/usuarios";
import { usarFormulario } from "@/hooks/usar-formulario";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import { CampoFormulario } from "@/componentes/comunes/campo-formulario";

export function FormularioCambiarContrasena() {
  const [claveActual, setClaveActual] = useState("");
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
