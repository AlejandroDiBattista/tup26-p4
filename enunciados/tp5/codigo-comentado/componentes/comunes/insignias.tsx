// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: componentes/comunes/insignias.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Insignias de estado del dominio (sección 10.6).
// Acá importamos componentes visuales de la interfaz de usuario
import { Badge } from "@/componentes/ui/badge";
import {
  NOMBRES_FORMA_PAGO,
  NOMBRES_MEDIO_PAGO,
  NOMBRES_TIPO_MOVIMIENTO,
} from "@/lib/formato";

// Componente o función exportada 'InsigniaEstadoFactura'
export function InsigniaEstadoFactura({ estado }: { estado: "emitida" | "anulada" }) {
  if (estado === "anulada") {
    return <Badge variant="destructive">Anulada</Badge>;
  }
  return <Badge variant="success">Emitida</Badge>;
}

// Componente o función exportada 'InsigniaStock'
export function InsigniaStock({
  existencia,
  stockMinimo,
}: {
  existencia: number;
  stockMinimo: number;
}) {
  // Verificamos si hay suficiente stock disponible para realizar la venta
  if (existencia === 0) {
    return <Badge variant="destructive">Sin stock</Badge>;
  }
  // Verificamos si hay suficiente stock disponible para realizar la venta
  if (existencia < stockMinimo) {
    return <Badge variant="warning">Bajo mínimo</Badge>;
  }
  return <Badge variant="success">Normal</Badge>;
}

// Componente o función exportada 'InsigniaRol'
export function InsigniaRol({ rol }: { rol: "admin" | "vendedor" }) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <Badge variant={rol === "admin" ? "default" : "secondary"}>
      {rol === "admin" ? "Administrador" : "Vendedor"}
    </Badge>
  );
}

// Componente o función exportada 'InsigniaActivo'
export function InsigniaActivo({ activo, textoInactivo = "Inactivo" }: { activo: boolean; textoInactivo?: string }) {
  return activo ? (
    <Badge variant="success">Activo</Badge>
  ) : (
    <Badge variant="secondary">{textoInactivo}</Badge>
  );
}

// Componente o función exportada 'InsigniaFormaPago'
export function InsigniaFormaPago({ forma }: { forma: string }) {
  return <Badge variant="outline">{NOMBRES_FORMA_PAGO[forma] ?? forma}</Badge>;
}

// Componente o función exportada 'InsigniaMedioPago'
export function InsigniaMedioPago({ medio }: { medio: string }) {
  return <Badge variant="outline">{NOMBRES_MEDIO_PAGO[medio] ?? medio}</Badge>;
}

// Componente o función exportada 'InsigniaTipoMovimiento'
export function InsigniaTipoMovimiento({ tipo }: { tipo: string }) {
  const variante =
    tipo === "ingreso" || tipo === "anulacion"
      ? "success"
      : tipo === "egreso"
        ? "warning"
        : "secondary";
  return <Badge variant={variante}>{NOMBRES_TIPO_MOVIMIENTO[tipo] ?? tipo}</Badge>;
}
