// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/login/page.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Página pública de inicio de sesión (/login).
// Queda fuera del layout con panel lateral (sección 4).
// Acá importamos funciones de navegación de Next.js (como redirect para cambiar de página)
import { redirect } from "next/navigation";
// Acá importamos las funciones para leer y validar la sesión del usuario conectado
import { obtenerUsuarioActual } from "@/lib/sesion";
// Acá importamos componentes visuales de la interfaz de usuario
import { FormularioLogin } from "@/componentes/dominio/formulario-login";
// Acá importamos componentes visuales de la interfaz de usuario
import { Caja } from "@/componentes/primitivas/maquetacion";

// Componente principal de página 'PaginaLogin' (Server Component: se ejecuta en el servidor)
export default async function PaginaLogin() {
  const usuario = await obtenerUsuarioActual();
  if (usuario) redirect("/");

  // Renderizamos la interfaz visual de este componente:
  return (
    <Caja className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-teal-50/40 to-slate-200 p-4">
      <FormularioLogin />
    </Caja>
  );
}
