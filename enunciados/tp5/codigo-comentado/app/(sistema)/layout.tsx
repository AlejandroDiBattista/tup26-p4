// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Layout compartido por todos los módulos autenticados del sistema (sección 4).
// Segunda barrera de protección (sección 10.5): comprueba el usuario contra la base de datos.
// [Línea 3] Importa elementos desde '@/lib/sesion'.
import { exigirUsuarioPagina } from "@/lib/sesion";
// [Línea 4] Importa elementos desde '@/componentes/estructura/panel-lateral'.
import { EstructuraAplicacion } from "@/componentes/estructura/panel-lateral";

// [Línea 6] Server Component principal 'LayoutSistema': se ejecuta en el servidor, consulta los servicios y devuelve el HTML.
export default async function LayoutSistema({ children }: { children: React.ReactNode }) {
  // [Línea 7] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'usuario'.
  const usuario = await exigirUsuarioPagina();
  // [Línea 8] Devuelve el valor: <EstructuraAplicacion usuario={usuario}>{children}</EstructuraAplicacion>;
  return <EstructuraAplicacion usuario={usuario}>{children}</EstructuraAplicacion>;
// [Línea 9] Cierra el bloque o estructura (}).
}
