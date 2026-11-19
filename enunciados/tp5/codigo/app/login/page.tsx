// Página pública de inicio de sesión (/login).
// Queda fuera del layout con panel lateral (sección 4).
import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/lib/sesion";
import { FormularioLogin } from "@/componentes/dominio/formulario-login";
import { Caja } from "@/componentes/primitivas/maquetacion";

export default async function PaginaLogin() {
  const usuario = await obtenerUsuarioActual();
  if (usuario) redirect("/");

  return (
    <Caja className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-teal-50/40 to-slate-200 p-4">
      <FormularioLogin />
    </Caja>
  );
}
