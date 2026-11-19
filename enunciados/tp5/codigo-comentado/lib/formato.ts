// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: lib/formato.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Único módulo de formatos (sección 10.6): moneda, fechas, documentos y numeración.
// Los componentes NO formatean por su cuenta: siempre usan estas funciones.

export const ZONA_HORARIA = "America/Argentina/Buenos_Aires";
export const PUNTO_DE_VENTA = 1;

const formatoMoneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

// 1234550 (centavos) -> "$ 12.345,50"
// Componente o función exportada 'formatearMoneda'
export function formatearMoneda(centavos: number | null | undefined): string {
  if (centavos === null || centavos === undefined) return "—";
  // Intl usa un espacio especial después del "$": lo cambiamos por uno común.
  return formatoMoneda.format(centavos / 100).replace(/\s/g, " ");
}

// "12.345,50" o "12345.5" (pesos escritos por el usuario) -> 1234550 centavos. null si no es número.
// Componente o función exportada 'pesosACentavos'
export function pesosACentavos(textoPesos: string): number | null {
  const limpio = textoPesos.trim().replace(/\$/g, "").replace(/\s/g, "");
  if (limpio === "") return null;
  // Si tiene coma, la coma es el decimal y los puntos son de miles (formato argentino).
  const normalizado = limpio.includes(",") ? limpio.replace(/\./g, "").replace(",", ".") : limpio;
  const pesos = Number(normalizado);
  if (Number.isNaN(pesos)) return null;
  return Math.round(pesos * 100);
}

// 1234550 -> "12345,50" (para mostrar un importe dentro de un campo editable)
// Componente o función exportada 'centavosATextoPesos'
export function centavosATextoPesos(centavos: number | null | undefined): string {
  if (centavos === null || centavos === undefined) return "";
  // Renderizamos la interfaz visual de este componente:
  return (centavos / 100).toFixed(2).replace(".", ",");
}

// Fecha -> "29/10/2026" en hora de Argentina
export function formatearFecha(fecha: Date | string | number): string {
  return new Date(fecha).toLocaleDateString("es-AR", {
    timeZone: ZONA_HORARIA,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Fecha -> "29/10/2026 15:24"
// Componente o función exportada 'formatearFechaHora'
export function formatearFechaHora(fecha: Date | string | number): string {
  const dia = formatearFecha(fecha);
  const hora = new Date(fecha).toLocaleTimeString("es-AR", {
    timeZone: ZONA_HORARIA,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${dia} ${hora}`;
}

// Fecha -> "2026-10-29" (el día según la hora de Argentina). Sirve para agrupar por día.
// Componente o función exportada 'diaArgentino'
export function diaArgentino(fecha: Date): string {
  // "en-CA" formatea como AAAA-MM-DD
  return fecha.toLocaleDateString("en-CA", { timeZone: ZONA_HORARIA });
}

// "2026-10-29" -> Date del comienzo de ese día en Argentina (UTC-3, sin horario de verano).
// Componente o función exportada 'inicioDelDia'
export function inicioDelDia(diaTexto: string): Date {
  return new Date(`${diaTexto}T00:00:00-03:00`);
}

// "2026-10-29" -> Date del final de ese día en Argentina.
// Componente o función exportada 'finDelDia'
export function finDelDia(diaTexto: string): Date {
  return new Date(`${diaTexto}T23:59:59.999-03:00`);
}

// (1, 1233) -> "0001-00001233"
// Componente o función exportada 'formatearNumeroFactura'
export function formatearNumeroFactura(puntoVenta: number, numero: number): string {
  return `${String(puntoVenta).padStart(4, "0")}-${String(numero).padStart(8, "0")}`;
}

// (1, 341) -> "R 0001-00000341"
// Componente o función exportada 'formatearNumeroRecibo'
export function formatearNumeroRecibo(puntoVenta: number, numero: number): string {
  return `R ${formatearNumeroFactura(puntoVenta, numero)}`;
}

// ("DNI", "28456123") -> "28.456.123"   ("CUIT", "20284561239") -> "20-28456123-9"
// Componente o función exportada 'formatearDocumento'
export function formatearDocumento(tipoDoc: string, nroDoc: string): string {
  const digitos = nroDoc.replace(/\D/g, "");
  if (tipoDoc === "CUIT" && digitos.length === 11) {
    return `${digitos.slice(0, 2)}-${digitos.slice(2, 10)}-${digitos.slice(10)}`;
  }
  return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Nombres legibles de las formas y medios de pago.
export const NOMBRES_FORMA_PAGO: Record<string, string> = {
  contado: "Contado",
  tarjeta: "Tarjeta",
  cuenta_corriente: "Cuenta corriente",
};

export const NOMBRES_MEDIO_PAGO: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta_debito: "Tarjeta de débito",
};

export const NOMBRES_TIPO_MOVIMIENTO: Record<string, string> = {
  venta: "Venta",
  anulacion: "Anulación",
  ingreso: "Ingreso",
  egreso: "Egreso",
};
