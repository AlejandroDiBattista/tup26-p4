/* ==========================================================================
   PANTALLA DE INICIO DE SESIÓN (/login)
   Página pública de acceso al sistema de la ferretería.
   
   CARACTERÍSTICAS:
   1. Es un Server Component que se ejecuta en el servidor.
   2. Queda fuera del layout del sistema (app/(sistema)/layout.tsx) para no mostrar
      la barra lateral ni los menús a usuarios no autenticados.
   3. Si el usuario ya tiene una sesión activa válida en la base de datos,
      lo redirige automáticamente a la pantalla principal (redirect("/"))
      para no obligarlo a loguearse de nuevo.
   ========================================================================== */

/* los import traen herramientas de redirección, sesión y componentes visuales:
   - redirect: función de Next.js para redirigir en el servidor
   - obtenerUsuarioActual: consulta si hay una cookie de sesión activa y válida
   - FormularioLogin: componente interactivo con inputs de email y contraseña
   - Caja: primitiva visual que envuelve el contenedor centrado */
import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/lib/sesion";
import { FormularioLogin } from "@/componentes/dominio/formulario-login";
import { Caja } from "@/componentes/primitivas/maquetacion";

/* exportación por defecto de la función asíncrona PaginaLogin */
export default async function PaginaLogin() {
  /* comprobamos si el visitante ya cuenta con una sesión abierta */
  const usuario = await obtenerUsuarioActual();

  /* si ya está logueado, lo enviamos directamente al Dashboard principal */
  if (usuario) redirect("/");

  /* renderizamos la vista centrada vertical y horizontalmente con un degradado sutil */
  return (
    <Caja className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-teal-50/40 to-slate-200 p-4">
      {/* renderizamos el formulario interactivo de login */}
      <FormularioLogin />
    </Caja>
  );
}
