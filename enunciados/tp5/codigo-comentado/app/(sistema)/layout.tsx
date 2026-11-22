// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/(sistema)/layout.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Layout compartido por todos los módulos autenticados del sistema (sección 4).
// Segunda barrera de protección (sección 10.5): comprueba el usuario contra la base de datos.
// Acá importamos las funciones para leer y validar la sesión del usuario conectado
import { exigirUsuarioPagina } from "@/lib/sesion";
// Acá importamos componentes visuales de la interfaz de usuario
import { EstructuraAplicacion } from "@/componentes/estructura/panel-lateral";

// Componente principal de página 'LayoutSistema' (Server Component: se ejecuta en el servidor)
export default async function LayoutSistema({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuarioPagina();
  return <EstructuraAplicacion usuario={usuario}>{children}</EstructuraAplicacion>;
}
