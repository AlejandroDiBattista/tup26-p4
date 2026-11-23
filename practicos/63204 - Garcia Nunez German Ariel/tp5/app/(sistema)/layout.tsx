/* ==========================================================================
   LAYOUT PRINCIPAL DEL SISTEMA (APP/(SISTEMA)/LAYOUT.TSX)
   Envoltorio compartido por todos los módulos autenticados de la aplicación.
   
   SEGUNDA BARRERA DE SEGURIDAD (SECCIÓN 10.5):
   Antes de permitir la carga de cualquier pantalla hija ({children}),
   este layout ejecuta exigirUsuarioPagina() en el servidor.
   Si la cookie fue manipulada, venció o el usuario fue desactivado en la base de datos,
   se corta el renderizado y se redirige a /login de inmediato.
   
   ESTRUCTURA VISUAL:
   Envuelve las páginas adentro de <EstructuraAplicacion>, la cual renderiza
   la barra lateral de navegación (Sidebar), el nombre y rol del empleado logueado,
   y el botón para cerrar la sesión.
   ========================================================================== */

/* importamos la función de verificación de sesión activa */
import { exigirUsuarioPagina } from "@/lib/sesion";

/* importamos el componente visual que dibuja el panel lateral responsivo */
import { EstructuraAplicacion } from "@/componentes/estructura/panel-lateral";

/* exportamos el componente LayoutSistema que recibe la propiedad especial 'children'
   (donde Next.js inyecta dinámicamente la página que el usuario solicitó) */
export default async function LayoutSistema({ children }: { children: React.ReactNode }) {
  /* 1. Comprobamos la autenticación y estado activo del usuario en la base de datos */
  const usuario = await exigirUsuarioPagina();

  /* 2. Renderizamos el marco de la aplicación pasando el usuario autenticado a la barra lateral */
  return <EstructuraAplicacion usuario={usuario}>{children}</EstructuraAplicacion>;
}
