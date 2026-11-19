// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Página pública de inicio de sesión (/login).
// Queda fuera del layout con panel lateral (sección 4).
// [Línea 3] Importa elementos desde 'next/navigation'.
import { redirect } from "next/navigation";
// [Línea 4] Importa elementos desde '@/lib/sesion'.
import { obtenerUsuarioActual } from "@/lib/sesion";
// [Línea 5] Importa elementos desde '@/componentes/dominio/formulario-login'.
import { FormularioLogin } from "@/componentes/dominio/formulario-login";
// [Línea 6] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Caja } from "@/componentes/primitivas/maquetacion";

// [Línea 8] Server Component principal 'PaginaLogin': se ejecuta en el servidor, consulta los servicios y devuelve el HTML.
export default async function PaginaLogin() {
  // [Línea 9] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
  const usuario = await obtenerUsuarioActual();
  // [Línea 10] Verifica la condición: if (usuario) redirect("/");
  if (usuario) redirect("/");

  // [Línea 12] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Caja className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-teal-50/40 to-slate-200 p-4"> // [Línea 13] Abre o renderiza el componente visual <Caja>.
      <FormularioLogin /> // [Línea 14] Abre o renderiza el componente visual <FormularioLogin>.
    </Caja> // [Línea 15] Cierra el componente visual </Caja>.
  // [Línea 16] Cierra el bloque o estructura ();).
  );
// [Línea 17] Cierra el bloque o estructura (}).
}
