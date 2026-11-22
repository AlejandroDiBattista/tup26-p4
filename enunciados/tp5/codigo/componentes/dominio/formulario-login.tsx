"use client";
// Formulario de inicio de sesión (RF-U1).
// Consume POST /api/auth/login y comparte el esquema de Zod "esquemaLogin".
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, LogIn } from "lucide-react";
import { esquemaLogin } from "@/esquemas/usuarios";
import { usarFormulario } from "@/hooks/usar-formulario";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import { CampoFormulario } from "@/componentes/comunes/campo-formulario";
import { Alinear, Apilar, Caja, Texto } from "@/componentes/primitivas/maquetacion";

export function FormularioLogin() {
  const router = useRouter();
  const [emailUsuario, setEmailUsuario] = useState("");
  const [passwordUsuario, setPasswordUsuario] = useState("");

  const { errores, errorGeneral, enviando, enviar } = usarFormulario({
    esquema: esquemaLogin,
    mensajeExito: "Bienvenido al sistema",
    accion: async (datosValidados) => {
      const respuesta = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosValidados),
      });
      const json = await respuesta.json();
      if (!respuesta.ok) {
        return { ok: false, error: json.error };
      }
      return { ok: true, data: json };
    },
    alTerminar: () => {
      router.push("/");
      router.refresh();
    },
  });

  function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    enviar({ email: emailUsuario, password: passwordUsuario });
  }

  function cargarCredencialPrueba(email: string, clave: string) {
    setEmailUsuario(email);
    setPasswordUsuario(clave);
  }

  return (
    <Card className="w-full max-w-md p-6 shadow-lg">
      <CardHeader className="items-center text-center pb-2">
        <Caja className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm mb-2">
          <Store className="size-6" />
        </Caja>
        <CardTitle className="text-xl">Ferretería El Yunque</CardTitle>
        <CardDescription>
          Sistema de gestión comercial · Facturación, stock y cuenta corriente
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
          <CampoFormulario etiqueta="Correo electrónico" error={errores.email}>
            <Input
              type="email"
              value={emailUsuario}
              onChange={(e) => setEmailUsuario(e.target.value)}
              placeholder="nombre@ferreteria.test"
              autoFocus
            />
          </CampoFormulario>

          <CampoFormulario etiqueta="Contraseña" error={errores.password}>
            <Input
              type="password"
              value={passwordUsuario}
              onChange={(e) => setPasswordUsuario(e.target.value)}
              placeholder="••••••••"
            />
          </CampoFormulario>

          {errorGeneral && (
            <Texto tamano="xs" tono="peligro" negrita>
              {errorGeneral}
            </Texto>
          )}

          <Button type="submit" disabled={enviando} className="w-full mt-1">
            <LogIn className="size-4" />
            {enviando ? "Ingresando..." : "Iniciar sesión"}
          </Button>
        </form>

        <Apilar className="gap-2 border-t border-border pt-4 mt-2">
          <Texto tamano="xs" tono="suave">
            Usuarios de prueba precargados (clic para completar):
          </Texto>
          <Alinear className="gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => cargarCredencialPrueba("laura@ferreteria.test", "admin1234")}
            >
              Admin (Laura)
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => cargarCredencialPrueba("pablo@ferreteria.test", "vendedor1234")}
            >
              Vendedor (Pablo)
            </Button>
          </Alinear>
        </Apilar>
      </CardContent>
    </Card>
  );
}
