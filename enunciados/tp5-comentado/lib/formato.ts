// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Único módulo de formatos (sección 10.6): moneda, fechas, documentos y numeración.
// Los componentes NO formatean por su cuenta: siempre usan estas funciones.

// [Línea 4] Declara y exporta la constante 'ZONA_HORARIA'.
export const ZONA_HORARIA = "America/Argentina/Buenos_Aires";
// [Línea 5] Declara y exporta la constante 'PUNTO_DE_VENTA'.
export const PUNTO_DE_VENTA = 1;

// [Línea 7] Declara 'formatoMoneda' y le asigna el valor resultante.
const formatoMoneda = new Intl.NumberFormat("es-AR", {
  // [Línea 8] Define o asigna el campo/parámetro 'style'.
  style: "currency",
  // [Línea 9] Define o asigna el campo/parámetro 'currency'.
  currency: "ARS",
  // [Línea 10] Define o asigna el campo/parámetro 'minimumFractionDigits'.
  minimumFractionDigits: 2,
// [Línea 11] Cierra el bloque o estructura (});).
});

// 1234550 (centavos) -> "$ 12.345,50"
// [Línea 14] Declara la función o componente 'formatearMoneda'.
export function formatearMoneda(centavos: number | null | undefined): string {
  // [Línea 15] Verifica la condición: if (centavos === null || centavos === undefined) return "—";
  if (centavos === null || centavos === undefined) return "—";
  // Intl usa un espacio especial después del "$": lo cambiamos por uno común.
  // [Línea 17] Devuelve el valor: formatoMoneda.format(centavos / 100).replace(/\s/g, " ");
  return formatoMoneda.format(centavos / 100).replace(/\s/g, " ");
// [Línea 18] Cierra el bloque o estructura (}).
}

// "12.345,50" o "12345.5" (pesos escritos por el usuario) -> 1234550 centavos. null si no es número.
// [Línea 21] Declara la función o componente 'pesosACentavos'.
export function pesosACentavos(textoPesos: string): number | null {
  // [Línea 22] Declara 'limpio' y le asigna el valor resultante.
  const limpio = textoPesos.trim().replace(/\$/g, "").replace(/\s/g, "");
  // [Línea 23] Verifica la condición: if (limpio === "") return null;
  if (limpio === "") return null;
  // Si tiene coma, la coma es el decimal y los puntos son de miles (formato argentino).
  // [Línea 25] Declara 'normalizado' y le asigna el valor resultante.
  const normalizado = limpio.includes(",") ? limpio.replace(/\./g, "").replace(",", ".") : limpio;
  // [Línea 26] Declara 'pesos' y le asigna el valor resultante.
  const pesos = Number(normalizado);
  // [Línea 27] Verifica la condición: if (Number.isNaN(pesos)) return null;
  if (Number.isNaN(pesos)) return null;
  // [Línea 28] Devuelve el valor: Math.round(pesos * 100);
  return Math.round(pesos * 100);
// [Línea 29] Cierra el bloque o estructura (}).
}

// 1234550 -> "12345,50" (para mostrar un importe dentro de un campo editable)
// [Línea 32] Declara la función o componente 'centavosATextoPesos'.
export function centavosATextoPesos(centavos: number | null | undefined): string {
  // [Línea 33] Verifica la condición: if (centavos === null || centavos === undefined) return "";
  if (centavos === null || centavos === undefined) return "";
  // [Línea 34] Devuelve la interfaz JSX que renderiza este componente.
  return (centavos / 100).toFixed(2).replace(".", ",");
// [Línea 35] Cierra el bloque o estructura (}).
}

// Fecha -> "29/10/2026" en hora de Argentina
// [Línea 38] Declara la función o componente 'formatearFecha'.
export function formatearFecha(fecha: Date | string | number): string {
  // [Línea 39] Devuelve el valor: new Date(fecha).toLocaleDateString("es-AR", {
  return new Date(fecha).toLocaleDateString("es-AR", {
    // [Línea 40] Define o asigna el campo/parámetro 'timeZone'.
    timeZone: ZONA_HORARIA,
    // [Línea 41] Define o asigna el campo/parámetro 'day'.
    day: "2-digit",
    // [Línea 42] Define o asigna el campo/parámetro 'month'.
    month: "2-digit",
    // [Línea 43] Define o asigna el campo/parámetro 'year'.
    year: "numeric",
  // [Línea 44] Cierra el bloque o estructura (});).
  });
// [Línea 45] Cierra el bloque o estructura (}).
}

// Fecha -> "29/10/2026 15:24"
// [Línea 48] Declara la función o componente 'formatearFechaHora'.
export function formatearFechaHora(fecha: Date | string | number): string {
  // [Línea 49] Declara 'dia' y le asigna el valor resultante.
  const dia = formatearFecha(fecha);
  // [Línea 50] Declara 'hora' y le asigna el valor resultante.
  const hora = new Date(fecha).toLocaleTimeString("es-AR", {
    // [Línea 51] Define o asigna el campo/parámetro 'timeZone'.
    timeZone: ZONA_HORARIA,
    // [Línea 52] Define o asigna el campo/parámetro 'hour'.
    hour: "2-digit",
    // [Línea 53] Define o asigna el campo/parámetro 'minute'.
    minute: "2-digit",
    // [Línea 54] Define o asigna el campo/parámetro 'hour12'.
    hour12: false,
  // [Línea 55] Cierra el bloque o estructura (});).
  });
  // [Línea 56] Devuelve el valor: `${dia} ${hora}`;
  return `${dia} ${hora}`;
// [Línea 57] Cierra el bloque o estructura (}).
}

// Fecha -> "2026-10-29" (el día según la hora de Argentina). Sirve para agrupar por día.
// [Línea 60] Declara la función o componente 'diaArgentino'.
export function diaArgentino(fecha: Date): string {
  // "en-CA" formatea como AAAA-MM-DD
  // [Línea 62] Devuelve el valor: fecha.toLocaleDateString("en-CA", { timeZone: ZONA_HORARIA });
  return fecha.toLocaleDateString("en-CA", { timeZone: ZONA_HORARIA });
// [Línea 63] Cierra el bloque o estructura (}).
}

// "2026-10-29" -> Date del comienzo de ese día en Argentina (UTC-3, sin horario de verano).
// [Línea 66] Declara la función o componente 'inicioDelDia'.
export function inicioDelDia(diaTexto: string): Date {
  // [Línea 67] Devuelve el valor: new Date(`${diaTexto}T00:00:00-03:00`);
  return new Date(`${diaTexto}T00:00:00-03:00`);
// [Línea 68] Cierra el bloque o estructura (}).
}

// "2026-10-29" -> Date del final de ese día en Argentina.
// [Línea 71] Declara la función o componente 'finDelDia'.
export function finDelDia(diaTexto: string): Date {
  // [Línea 72] Devuelve el valor: new Date(`${diaTexto}T23:59:59.999-03:00`);
  return new Date(`${diaTexto}T23:59:59.999-03:00`);
// [Línea 73] Cierra el bloque o estructura (}).
}

// (1, 1233) -> "0001-00001233"
// [Línea 76] Declara la función o componente 'formatearNumeroFactura'.
export function formatearNumeroFactura(puntoVenta: number, numero: number): string {
  // [Línea 77] Devuelve el valor: `${String(puntoVenta).padStart(4, "0")}-${String(numero).padStart(8, "0")}`;
  return `${String(puntoVenta).padStart(4, "0")}-${String(numero).padStart(8, "0")}`;
// [Línea 78] Cierra el bloque o estructura (}).
}

// (1, 341) -> "R 0001-00000341"
// [Línea 81] Declara la función o componente 'formatearNumeroRecibo'.
export function formatearNumeroRecibo(puntoVenta: number, numero: number): string {
  // [Línea 82] Devuelve el valor: `R ${formatearNumeroFactura(puntoVenta, numero)}`;
  return `R ${formatearNumeroFactura(puntoVenta, numero)}`;
// [Línea 83] Cierra el bloque o estructura (}).
}

// ("DNI", "28456123") -> "28.456.123"   ("CUIT", "20284561239") -> "20-28456123-9"
// [Línea 86] Declara la función o componente 'formatearDocumento'.
export function formatearDocumento(tipoDoc: string, nroDoc: string): string {
  // [Línea 87] Declara 'digitos' y le asigna el valor resultante.
  const digitos = nroDoc.replace(/\D/g, "");
  // [Línea 88] Verifica la condición: if (tipoDoc === "CUIT" && digitos.length === 11) {
  if (tipoDoc === "CUIT" && digitos.length === 11) {
    // [Línea 89] Devuelve el valor: `${digitos.slice(0, 2)}-${digitos.slice(2, 10)}-${digitos.slice(10)}`;
    return `${digitos.slice(0, 2)}-${digitos.slice(2, 10)}-${digitos.slice(10)}`;
  // [Línea 90] Cierra el bloque o estructura (}).
  }
  // [Línea 91] Devuelve el valor: digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
// [Línea 92] Cierra el bloque o estructura (}).
}

// Nombres legibles de las formas y medios de pago.
// [Línea 95] Declara y exporta la constante 'NOMBRES_FORMA_PAGO'.
export const NOMBRES_FORMA_PAGO: Record<string, string> = {
  // [Línea 96] Define o asigna el campo/parámetro 'contado'.
  contado: "Contado",
  // [Línea 97] Define o asigna el campo/parámetro 'tarjeta'.
  tarjeta: "Tarjeta",
  // [Línea 98] Define o asigna el campo/parámetro 'cuenta_corriente'.
  cuenta_corriente: "Cuenta corriente",
// [Línea 99] Cierra el bloque o estructura (};).
};

// [Línea 101] Declara y exporta la constante 'NOMBRES_MEDIO_PAGO'.
export const NOMBRES_MEDIO_PAGO: Record<string, string> = {
  // [Línea 102] Define o asigna el campo/parámetro 'efectivo'.
  efectivo: "Efectivo",
  // [Línea 103] Define o asigna el campo/parámetro 'transferencia'.
  transferencia: "Transferencia",
  // [Línea 104] Define o asigna el campo/parámetro 'tarjeta_debito'.
  tarjeta_debito: "Tarjeta de débito",
// [Línea 105] Cierra el bloque o estructura (};).
};

// [Línea 107] Declara y exporta la constante 'NOMBRES_TIPO_MOVIMIENTO'.
export const NOMBRES_TIPO_MOVIMIENTO: Record<string, string> = {
  // [Línea 108] Define o asigna el campo/parámetro 'venta'.
  venta: "Venta",
  // [Línea 109] Define o asigna el campo/parámetro 'anulacion'.
  anulacion: "Anulación",
  // [Línea 110] Define o asigna el campo/parámetro 'ingreso'.
  ingreso: "Ingreso",
  // [Línea 111] Define o asigna el campo/parámetro 'egreso'.
  egreso: "Egreso",
// [Línea 112] Cierra el bloque o estructura (};).
};
