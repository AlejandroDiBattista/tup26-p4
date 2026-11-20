// Insignias de estado del dominio (sección 10.6).
import { Badge } from "@/componentes/ui/badge";
import {
  NOMBRES_FORMA_PAGO,
  NOMBRES_MEDIO_PAGO,
  NOMBRES_TIPO_MOVIMIENTO,
} from "@/lib/formato";

export function InsigniaEstadoFactura({ estado }: { estado: "emitida" | "anulada" }) {
  if (estado === "anulada") {
    return <Badge variant="destructive">Anulada</Badge>;
  }
  return <Badge variant="success">Emitida</Badge>;
}

export function InsigniaStock({
  existencia,
  stockMinimo,
}: {
  existencia: number;
  stockMinimo: number;
}) {
  if (existencia === 0) {
    return <Badge variant="destructive">Sin stock</Badge>;
  }
  if (existencia < stockMinimo) {
    return <Badge variant="warning">Bajo mínimo</Badge>;
  }
  return <Badge variant="success">Normal</Badge>;
}

export function InsigniaRol({ rol }: { rol: "admin" | "vendedor" }) {
  return (
    <Badge variant={rol === "admin" ? "default" : "secondary"}>
      {rol === "admin" ? "Administrador" : "Vendedor"}
    </Badge>
  );
}

export function InsigniaActivo({ activo, textoInactivo = "Inactivo" }: { activo: boolean; textoInactivo?: string }) {
  return activo ? (
    <Badge variant="success">Activo</Badge>
  ) : (
    <Badge variant="secondary">{textoInactivo}</Badge>
  );
}

export function InsigniaFormaPago({ forma }: { forma: string }) {
  return <Badge variant="outline">{NOMBRES_FORMA_PAGO[forma] ?? forma}</Badge>;
}

export function InsigniaMedioPago({ medio }: { medio: string }) {
  return <Badge variant="outline">{NOMBRES_MEDIO_PAGO[medio] ?? medio}</Badge>;
}

export function InsigniaTipoMovimiento({ tipo }: { tipo: string }) {
  const variante =
    tipo === "ingreso" || tipo === "anulacion"
      ? "success"
      : tipo === "egreso"
        ? "warning"
        : "secondary";
  return <Badge variant={variante}>{NOMBRES_TIPO_MOVIMIENTO[tipo] ?? tipo}</Badge>;
}
