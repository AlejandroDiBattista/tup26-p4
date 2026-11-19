// Estado de carga automático de Next.js mientras se resuelve una página (sección 8).
import { EstadoCargando } from "@/componentes/comunes/estados";

export default function CargandoPagina() {
  return <EstadoCargando texto="Cargando información del módulo..." />;
}
