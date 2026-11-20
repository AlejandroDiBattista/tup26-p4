// Layout compartido por todos los módulos autenticados del sistema (sección 4).
// Segunda barrera de protección (sección 10.5): comprueba el usuario contra la base de datos.
import { exigirUsuarioPagina } from "@/lib/sesion";
import { EstructuraAplicacion } from "@/componentes/estructura/panel-lateral";

export default async function LayoutSistema({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuarioPagina();
  return <EstructuraAplicacion usuario={usuario}>{children}</EstructuraAplicacion>;
}
