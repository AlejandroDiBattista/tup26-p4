// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/(sistema)/loading.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Estado de carga automático de Next.js mientras se resuelve una página (sección 8).
// Acá importamos componentes visuales de la interfaz de usuario
import { EstadoCargando } from "@/componentes/comunes/estados";

// Componente principal 'CargandoPagina'
export default function CargandoPagina() {
  return <EstadoCargando texto="Cargando información del módulo..." />;
}
