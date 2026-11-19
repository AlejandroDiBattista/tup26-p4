// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// [Línea 1] Directiva de Next.js: marca este archivo como Client Component (se ejecuta en el navegador con estado e interactividad).
"use client";
// Formulario para que cada usuario cambie su propia contraseña desde /perfil (RF-U5).
// [Línea 3] Importa elementos desde 'react'.
import { useState } from "react";
// [Línea 4] Importa elementos desde 'lucide-react'.
import { KeyRound } from "lucide-react";
// [Línea 5] Importa elementos desde '@/acciones/comercial'.
import { accionCambiarContrasena } from "@/acciones/comercial";
// [Línea 6] Importa elementos desde '@/esquemas/usuarios'.
import { esquemaCambioContrasena } from "@/esquemas/usuarios";
// [Línea 7] Importa elementos desde '@/hooks/usar-formulario'.
import { usarFormulario } from "@/hooks/usar-formulario";
// [Línea 8] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 9] Importa elementos desde '@/componentes/ui/input'.
import { Input } from "@/componentes/ui/input";
// [Línea 10] Importa elementos desde '@/componentes/ui/card'.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
// [Línea 11] Importa elementos desde '@/componentes/comunes/campo-formulario'.
import { CampoFormulario } from "@/componentes/comunes/campo-formulario";

// [Línea 13] Declara la función o componente 'FormularioCambiarContrasena'.
export function FormularioCambiarContrasena() {
  // [Línea 14] Estado reactivo de React [claveActual, setClaveActual]: guarda el valor actual y la función para actualizarlo.
  const [claveActual, setClaveActual] = useState("");
  // [Línea 15] Estado reactivo de React [claveNueva, setClaveNueva]: guarda el valor actual y la función para actualizarlo.
  const [claveNueva, setClaveNueva] = useState("");

  // [Línea 17] Declara '{ errores, enviando, enviar }' y le asigna el valor resultante.
  const { errores, enviando, enviar } = usarFormulario({
    // [Línea 18] Define o asigna el campo/parámetro 'esquema'.
    esquema: esquemaCambioContrasena,
    // [Línea 19] Define o asigna el campo/parámetro 'accion'.
    accion: (datos) => accionCambiarContrasena(datos),
    // [Línea 20] Define o asigna el campo/parámetro 'mensajeExito'.
    mensajeExito: "Tu contraseña se actualizó correctamente",
    // [Línea 21] Define o asigna el campo/parámetro 'alTerminar'.
    alTerminar: () => {
      // [Línea 22] Ejecuta o evalúa: setClaveActual("");
      setClaveActual("");
      // [Línea 23] Ejecuta o evalúa: setClaveNueva("");
      setClaveNueva("");
    // [Línea 24] Cierra el bloque o estructura (},).
    },
  // [Línea 25] Cierra el bloque o estructura (});).
  });

  // [Línea 27] Declara la función o componente 'manejarSubmit'.
  function manejarSubmit(e: React.FormEvent) {
    // [Línea 28] Ejecuta o evalúa: e.preventDefault();
    e.preventDefault();
    // [Línea 29] Ejecuta o evalúa: enviar({ actual: claveActual, nueva: claveNueva });
    enviar({ actual: claveActual, nueva: claveNueva });
  // [Línea 30] Cierra el bloque o estructura (}).
  }

  // [Línea 32] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Card className="max-w-lg"> // [Línea 33] Abre o renderiza el componente visual <Card>.
      <CardHeader> // [Línea 34] Abre o renderiza el componente visual <CardHeader>.
        <CardTitle>Cambiar contraseña</CardTitle> // [Línea 35] Abre o renderiza el componente visual <CardTitle>.
        <CardDescription> // [Línea 36] Abre o renderiza el componente visual <CardDescription>.
          // [Línea 37] Ejecuta o evalúa: Ingresá tu contraseña actual y definí una nueva de al menos 8 caracteres.
          Ingresá tu contraseña actual y definí una nueva de al menos 8 caracteres.
        </CardDescription> // [Línea 38] Cierra el componente visual </CardDescription>.
      </CardHeader> // [Línea 39] Cierra el componente visual </CardHeader>.
      <CardContent> // [Línea 40] Abre o renderiza el componente visual <CardContent>.
        <form onSubmit={manejarSubmit} className="flex flex-col gap-4"> // [Línea 41] Abre o renderiza el componente visual <form>.
          <CampoFormulario etiqueta="Contraseña actual" error={errores.actual}> // [Línea 42] Abre o renderiza el componente visual <CampoFormulario>.
            <Input // [Línea 43] Abre o renderiza el componente visual <Input>.
              // [Línea 44] Ejecuta o evalúa: type="password"
              type="password"
              // [Línea 45] Ejecuta o evalúa: value={claveActual}
              value={claveActual}
              // [Línea 46] Ejecuta o evalúa: onChange={(e) => setClaveActual(e.target.value)}
              onChange={(e) => setClaveActual(e.target.value)}
              // [Línea 47] Ejecuta o evalúa: placeholder="••••••••"
              placeholder="••••••••"
            // [Línea 48] Ejecuta o evalúa: />
            />
          </CampoFormulario> // [Línea 49] Cierra el componente visual </CampoFormulario>.

          <CampoFormulario // [Línea 51] Abre o renderiza el componente visual <CampoFormulario>.
            // [Línea 52] Ejecuta o evalúa: etiqueta="Nueva contraseña"
            etiqueta="Nueva contraseña"
            // [Línea 53] Ejecuta o evalúa: error={errores.nueva}
            error={errores.nueva}
            // [Línea 54] Ejecuta o evalúa: ayuda="Debe tener como mínimo 8 caracteres."
            ayuda="Debe tener como mínimo 8 caracteres."
          // [Línea 55] Ejecuta o evalúa: >
          >
            <Input // [Línea 56] Abre o renderiza el componente visual <Input>.
              // [Línea 57] Ejecuta o evalúa: type="password"
              type="password"
              // [Línea 58] Ejecuta o evalúa: value={claveNueva}
              value={claveNueva}
              // [Línea 59] Ejecuta o evalúa: onChange={(e) => setClaveNueva(e.target.value)}
              onChange={(e) => setClaveNueva(e.target.value)}
              // [Línea 60] Ejecuta o evalúa: placeholder="••••••••"
              placeholder="••••••••"
            // [Línea 61] Ejecuta o evalúa: />
            />
          </CampoFormulario> // [Línea 62] Cierra el componente visual </CampoFormulario>.

          <Button type="submit" disabled={enviando} className="self-start"> // [Línea 64] Abre o renderiza el componente visual <Button>.
            <KeyRound className="size-4" /> // [Línea 65] Abre o renderiza el componente visual <KeyRound>.
            // [Línea 66] Ejecuta o evalúa: {enviando ? "Actualizando..." : "Actualizar contraseña"}
            {enviando ? "Actualizando..." : "Actualizar contraseña"}
          </Button> // [Línea 67] Cierra el componente visual </Button>.
        </form> // [Línea 68] Cierra el componente visual </form>.
      </CardContent> // [Línea 69] Cierra el componente visual </CardContent>.
    </Card> // [Línea 70] Cierra el componente visual </Card>.
  // [Línea 71] Cierra el bloque o estructura ();).
  );
// [Línea 72] Cierra el bloque o estructura (}).
}
