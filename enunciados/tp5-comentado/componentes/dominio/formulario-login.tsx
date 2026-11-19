// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// [Línea 1] Directiva de Next.js: marca este archivo como Client Component (se ejecuta en el navegador con estado e interactividad).
"use client";
// Formulario de inicio de sesión (RF-U1).
// Consume POST /api/auth/login y comparte el esquema de Zod "esquemaLogin".
// [Línea 4] Importa elementos desde 'react'.
import { useState } from "react";
// [Línea 5] Importa elementos desde 'next/navigation'.
import { useRouter } from "next/navigation";
// [Línea 6] Importa elementos desde 'lucide-react'.
import { Store, LogIn } from "lucide-react";
// [Línea 7] Importa elementos desde '@/esquemas/usuarios'.
import { esquemaLogin } from "@/esquemas/usuarios";
// [Línea 8] Importa elementos desde '@/hooks/usar-formulario'.
import { usarFormulario } from "@/hooks/usar-formulario";
// [Línea 9] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 10] Importa elementos desde '@/componentes/ui/input'.
import { Input } from "@/componentes/ui/input";
// [Línea 11] Importa elementos desde '@/componentes/ui/card'.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
// [Línea 12] Importa elementos desde '@/componentes/comunes/campo-formulario'.
import { CampoFormulario } from "@/componentes/comunes/campo-formulario";
// [Línea 13] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Apilar, Caja, Texto } from "@/componentes/primitivas/maquetacion";

// [Línea 15] Declara la función o componente 'FormularioLogin'.
export function FormularioLogin() {
  // [Línea 16] Declara 'router' y le asigna el valor resultante.
  const router = useRouter();
  // [Línea 17] Estado reactivo de React [emailUsuario, setEmailUsuario]: guarda el valor actual y la función para actualizarlo.
  const [emailUsuario, setEmailUsuario] = useState("");
  // [Línea 18] Estado reactivo de React [passwordUsuario, setPasswordUsuario]: guarda el valor actual y la función para actualizarlo.
  const [passwordUsuario, setPasswordUsuario] = useState("");

  // [Línea 20] Declara '{ errores, errorGeneral, enviando, enviar }' y le asigna el valor resultante.
  const { errores, errorGeneral, enviando, enviar } = usarFormulario({
    // [Línea 21] Define o asigna el campo/parámetro 'esquema'.
    esquema: esquemaLogin,
    // [Línea 22] Define o asigna el campo/parámetro 'mensajeExito'.
    mensajeExito: "Bienvenido al sistema",
    // [Línea 23] Define o asigna el campo/parámetro 'accion'.
    accion: async (datosValidados) => {
      // [Línea 24] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'respuesta'.
      const respuesta = await fetch("/api/auth/login", {
        // [Línea 25] Define o asigna el campo/parámetro 'method'.
        method: "POST",
        // [Línea 26] Define o asigna el campo/parámetro 'headers'.
        headers: { "Content-Type": "application/json" },
        // [Línea 27] Define o asigna el campo/parámetro 'body'.
        body: JSON.stringify(datosValidados),
      // [Línea 28] Cierra el bloque o estructura (});).
      });
      // [Línea 29] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'json'.
      const json = await respuesta.json();
      // [Línea 30] Verifica la condición: if (!respuesta.ok) {
      if (!respuesta.ok) {
        // [Línea 31] Devuelve el valor: { ok: false, error: json.error };
        return { ok: false, error: json.error };
      // [Línea 32] Cierra el bloque o estructura (}).
      }
      // [Línea 33] Devuelve el valor: { ok: true, data: json };
      return { ok: true, data: json };
    // [Línea 34] Cierra el bloque o estructura (},).
    },
    // [Línea 35] Define o asigna el campo/parámetro 'alTerminar'.
    alTerminar: () => {
      // [Línea 36] Ejecuta o evalúa: router.push("/");
      router.push("/");
      // [Línea 37] Ejecuta o evalúa: router.refresh();
      router.refresh();
    // [Línea 38] Cierra el bloque o estructura (},).
    },
  // [Línea 39] Cierra el bloque o estructura (});).
  });

  // [Línea 41] Declara la función o componente 'manejarSubmit'.
  function manejarSubmit(e: React.FormEvent) {
    // [Línea 42] Ejecuta o evalúa: e.preventDefault();
    e.preventDefault();
    // [Línea 43] Ejecuta o evalúa: enviar({ email: emailUsuario, password: passwordUsuario });
    enviar({ email: emailUsuario, password: passwordUsuario });
  // [Línea 44] Cierra el bloque o estructura (}).
  }

  // [Línea 46] Declara la función o componente 'cargarCredencialPrueba'.
  function cargarCredencialPrueba(email: string, clave: string) {
    // [Línea 47] Ejecuta o evalúa: setEmailUsuario(email);
    setEmailUsuario(email);
    // [Línea 48] Ejecuta o evalúa: setPasswordUsuario(clave);
    setPasswordUsuario(clave);
  // [Línea 49] Cierra el bloque o estructura (}).
  }

  // [Línea 51] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Card className="w-full max-w-md p-6 shadow-lg"> // [Línea 52] Abre o renderiza el componente visual <Card>.
      <CardHeader className="items-center text-center pb-2"> // [Línea 53] Abre o renderiza el componente visual <CardHeader>.
        <Caja className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm mb-2"> // [Línea 54] Abre o renderiza el componente visual <Caja>.
          <Store className="size-6" /> // [Línea 55] Abre o renderiza el componente visual <Store>.
        </Caja> // [Línea 56] Cierra el componente visual </Caja>.
        <CardTitle className="text-xl">Ferretería El Yunque</CardTitle> // [Línea 57] Abre o renderiza el componente visual <CardTitle>.
        <CardDescription> // [Línea 58] Abre o renderiza el componente visual <CardDescription>.
          // [Línea 59] Ejecuta o evalúa: Sistema de gestión comercial · Facturación, stock y cuenta corriente
          Sistema de gestión comercial · Facturación, stock y cuenta corriente
        </CardDescription> // [Línea 60] Cierra el componente visual </CardDescription>.
      </CardHeader> // [Línea 61] Cierra el componente visual </CardHeader>.

      <CardContent> // [Línea 63] Abre o renderiza el componente visual <CardContent>.
        <form onSubmit={manejarSubmit} className="flex flex-col gap-4"> // [Línea 64] Abre o renderiza el componente visual <form>.
          <CampoFormulario etiqueta="Correo electrónico" error={errores.email}> // [Línea 65] Abre o renderiza el componente visual <CampoFormulario>.
            <Input // [Línea 66] Abre o renderiza el componente visual <Input>.
              // [Línea 67] Ejecuta o evalúa: type="email"
              type="email"
              // [Línea 68] Ejecuta o evalúa: value={emailUsuario}
              value={emailUsuario}
              // [Línea 69] Ejecuta o evalúa: onChange={(e) => setEmailUsuario(e.target.value)}
              onChange={(e) => setEmailUsuario(e.target.value)}
              // [Línea 70] Ejecuta o evalúa: placeholder="nombre@ferreteria.test"
              placeholder="nombre@ferreteria.test"
              // [Línea 71] Ejecuta o evalúa: autoFocus
              autoFocus
            // [Línea 72] Ejecuta o evalúa: />
            />
          </CampoFormulario> // [Línea 73] Cierra el componente visual </CampoFormulario>.

          <CampoFormulario etiqueta="Contraseña" error={errores.password}> // [Línea 75] Abre o renderiza el componente visual <CampoFormulario>.
            <Input // [Línea 76] Abre o renderiza el componente visual <Input>.
              // [Línea 77] Ejecuta o evalúa: type="password"
              type="password"
              // [Línea 78] Ejecuta o evalúa: value={passwordUsuario}
              value={passwordUsuario}
              // [Línea 79] Ejecuta o evalúa: onChange={(e) => setPasswordUsuario(e.target.value)}
              onChange={(e) => setPasswordUsuario(e.target.value)}
              // [Línea 80] Ejecuta o evalúa: placeholder="••••••••"
              placeholder="••••••••"
            // [Línea 81] Ejecuta o evalúa: />
            />
          </CampoFormulario> // [Línea 82] Cierra el componente visual </CampoFormulario>.

          // [Línea 84] Ejecuta o evalúa: {errorGeneral && (
          {errorGeneral && (
            <Texto tamano="xs" tono="peligro" negrita> // [Línea 85] Abre o renderiza el componente visual <Texto>.
              // [Línea 86] Ejecuta o evalúa: {errorGeneral}
              {errorGeneral}
            </Texto> // [Línea 87] Cierra el componente visual </Texto>.
          // [Línea 88] Ejecuta o evalúa: )}
          )}

          <Button type="submit" disabled={enviando} className="w-full mt-1"> // [Línea 90] Abre o renderiza el componente visual <Button>.
            <LogIn className="size-4" /> // [Línea 91] Abre o renderiza el componente visual <LogIn>.
            // [Línea 92] Ejecuta o evalúa: {enviando ? "Ingresando..." : "Iniciar sesión"}
            {enviando ? "Ingresando..." : "Iniciar sesión"}
          </Button> // [Línea 93] Cierra el componente visual </Button>.
        </form> // [Línea 94] Cierra el componente visual </form>.

        <Apilar className="gap-2 border-t border-border pt-4 mt-2"> // [Línea 96] Abre o renderiza el componente visual <Apilar>.
          <Texto tamano="xs" tono="suave"> // [Línea 97] Abre o renderiza el componente visual <Texto>.
            // [Línea 98] Ejecuta o evalúa: Usuarios de prueba precargados (clic para completar):
            Usuarios de prueba precargados (clic para completar):
          </Texto> // [Línea 99] Cierra el componente visual </Texto>.
          <Alinear className="gap-2"> // [Línea 100] Abre o renderiza el componente visual <Alinear>.
            <Button // [Línea 101] Abre o renderiza el componente visual <Button>.
              // [Línea 102] Ejecuta o evalúa: variant="outline"
              variant="outline"
              // [Línea 103] Ejecuta o evalúa: size="xs"
              size="xs"
              // [Línea 104] Ejecuta o evalúa: onClick={() => cargarCredencialPrueba("laura@ferreteria.test", "admin1234")}
              onClick={() => cargarCredencialPrueba("laura@ferreteria.test", "admin1234")}
            // [Línea 105] Ejecuta o evalúa: >
            >
              // [Línea 106] Ejecuta o evalúa: Admin (Laura)
              Admin (Laura)
            </Button> // [Línea 107] Cierra el componente visual </Button>.
            <Button // [Línea 108] Abre o renderiza el componente visual <Button>.
              // [Línea 109] Ejecuta o evalúa: variant="outline"
              variant="outline"
              // [Línea 110] Ejecuta o evalúa: size="xs"
              size="xs"
              // [Línea 111] Ejecuta o evalúa: onClick={() => cargarCredencialPrueba("pablo@ferreteria.test", "vendedor1234")}
              onClick={() => cargarCredencialPrueba("pablo@ferreteria.test", "vendedor1234")}
            // [Línea 112] Ejecuta o evalúa: >
            >
              // [Línea 113] Ejecuta o evalúa: Vendedor (Pablo)
              Vendedor (Pablo)
            </Button> // [Línea 114] Cierra el componente visual </Button>.
          </Alinear> // [Línea 115] Cierra el componente visual </Alinear>.
        </Apilar> // [Línea 116] Cierra el componente visual </Apilar>.
      </CardContent> // [Línea 117] Cierra el componente visual </CardContent>.
    </Card> // [Línea 118] Cierra el componente visual </Card>.
  // [Línea 119] Cierra el bloque o estructura ();).
  );
// [Línea 120] Cierra el bloque o estructura (}).
}
