// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Insignias de estado del dominio (sección 10.6).
// [Línea 2] Importa elementos desde '@/componentes/ui/badge'.
import { Badge } from "@/componentes/ui/badge";
// [Línea 3] Inicia un bloque de importación de dependencias.
import {
  // [Línea 4] Importa 'NOMBRES_FORMA_PAGO' desde el módulo.
  NOMBRES_FORMA_PAGO,
  // [Línea 5] Importa 'NOMBRES_MEDIO_PAGO' desde el módulo.
  NOMBRES_MEDIO_PAGO,
  // [Línea 6] Importa 'NOMBRES_TIPO_MOVIMIENTO' desde el módulo.
  NOMBRES_TIPO_MOVIMIENTO,
// [Línea 7] Cierra la lista de importaciones provenientes del módulo '@/lib/formato'.
} from "@/lib/formato";

// [Línea 9] Declara la función o componente 'InsigniaEstadoFactura'.
export function InsigniaEstadoFactura({ estado }: { estado: "emitida" | "anulada" }) {
  // [Línea 10] Verifica la condición: if (estado === "anulada") {
  if (estado === "anulada") {
    // [Línea 11] Devuelve el valor: <Badge variant="destructive">Anulada</Badge>;
    return <Badge variant="destructive">Anulada</Badge>;
  // [Línea 12] Cierra el bloque o estructura (}).
  }
  // [Línea 13] Devuelve el valor: <Badge variant="success">Emitida</Badge>;
  return <Badge variant="success">Emitida</Badge>;
// [Línea 14] Cierra el bloque o estructura (}).
}

// [Línea 16] Declara la función o componente 'InsigniaStock'.
export function InsigniaStock({
  // [Línea 17] Ejecuta o evalúa: existencia,
  existencia,
  // [Línea 18] Ejecuta o evalúa: stockMinimo,
  stockMinimo,
// [Línea 19] Ejecuta o evalúa: }: {
}: {
  // [Línea 20] Define o asigna el campo/parámetro 'existencia'.
  existencia: number;
  // [Línea 21] Define o asigna el campo/parámetro 'stockMinimo'.
  stockMinimo: number;
// [Línea 22] Ejecuta o evalúa: }) {
}) {
  // [Línea 23] Verifica la condición: if (existencia === 0) {
  if (existencia === 0) {
    // [Línea 24] Devuelve el valor: <Badge variant="destructive">Sin stock</Badge>;
    return <Badge variant="destructive">Sin stock</Badge>;
  // [Línea 25] Cierra el bloque o estructura (}).
  }
  // [Línea 26] Verifica la condición: if (existencia < stockMinimo) {
  if (existencia < stockMinimo) {
    // [Línea 27] Devuelve el valor: <Badge variant="warning">Bajo mínimo</Badge>;
    return <Badge variant="warning">Bajo mínimo</Badge>;
  // [Línea 28] Cierra el bloque o estructura (}).
  }
  // [Línea 29] Devuelve el valor: <Badge variant="success">Normal</Badge>;
  return <Badge variant="success">Normal</Badge>;
// [Línea 30] Cierra el bloque o estructura (}).
}

// [Línea 32] Declara la función o componente 'InsigniaRol'.
export function InsigniaRol({ rol }: { rol: "admin" | "vendedor" }) {
  // [Línea 33] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Badge variant={rol === "admin" ? "default" : "secondary"}> // [Línea 34] Abre o renderiza el componente visual <Badge>.
      // [Línea 35] Ejecuta o evalúa: {rol === "admin" ? "Administrador" : "Vendedor"}
      {rol === "admin" ? "Administrador" : "Vendedor"}
    </Badge> // [Línea 36] Cierra el componente visual </Badge>.
  // [Línea 37] Cierra el bloque o estructura ();).
  );
// [Línea 38] Cierra el bloque o estructura (}).
}

// [Línea 40] Declara la función o componente 'InsigniaActivo'.
export function InsigniaActivo({ activo, textoInactivo = "Inactivo" }: { activo: boolean; textoInactivo?: string }) {
  // [Línea 41] Devuelve el valor: activo ? (
  return activo ? (
    <Badge variant="success">Activo</Badge> // [Línea 42] Abre o renderiza el componente visual <Badge>.
  // [Línea 43] Ejecuta o evalúa: ) : (
  ) : (
    <Badge variant="secondary">{textoInactivo}</Badge> // [Línea 44] Abre o renderiza el componente visual <Badge>.
  // [Línea 45] Cierra el bloque o estructura ();).
  );
// [Línea 46] Cierra el bloque o estructura (}).
}

// [Línea 48] Declara la función o componente 'InsigniaFormaPago'.
export function InsigniaFormaPago({ forma }: { forma: string }) {
  // [Línea 49] Devuelve el valor: <Badge variant="outline">{NOMBRES_FORMA_PAGO[forma] ?? forma}</Badge>;
  return <Badge variant="outline">{NOMBRES_FORMA_PAGO[forma] ?? forma}</Badge>;
// [Línea 50] Cierra el bloque o estructura (}).
}

// [Línea 52] Declara la función o componente 'InsigniaMedioPago'.
export function InsigniaMedioPago({ medio }: { medio: string }) {
  // [Línea 53] Devuelve el valor: <Badge variant="outline">{NOMBRES_MEDIO_PAGO[medio] ?? medio}</Badge>;
  return <Badge variant="outline">{NOMBRES_MEDIO_PAGO[medio] ?? medio}</Badge>;
// [Línea 54] Cierra el bloque o estructura (}).
}

// [Línea 56] Declara la función o componente 'InsigniaTipoMovimiento'.
export function InsigniaTipoMovimiento({ tipo }: { tipo: string }) {
  // [Línea 57] Declara 'variante' y le asigna el valor resultante.
  const variante =
    // [Línea 58] Ejecuta o evalúa: tipo === "ingreso" || tipo === "anulacion"
    tipo === "ingreso" || tipo === "anulacion"
      // [Línea 59] Ejecuta o evalúa: ? "success"
      ? "success"
      // [Línea 60] Ejecuta o evalúa: : tipo === "egreso"
      : tipo === "egreso"
        // [Línea 61] Ejecuta o evalúa: ? "warning"
        ? "warning"
        // [Línea 62] Ejecuta o evalúa: : "secondary";
        : "secondary";
  // [Línea 63] Devuelve el valor: <Badge variant={variante}>{NOMBRES_TIPO_MOVIMIENTO[tipo] ?? tipo}</Badge>;
  return <Badge variant={variante}>{NOMBRES_TIPO_MOVIMIENTO[tipo] ?? tipo}</Badge>;
// [Línea 64] Cierra el bloque o estructura (}).
}
