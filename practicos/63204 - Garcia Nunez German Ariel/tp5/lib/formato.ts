/* ==========================================================================
   MÓDULO CENTRAL DE FORMATOS Y TRANSFORMACIONES (LIB/FORMATO.TS)
   Este archivo es la fuente única de verdad para el formateo de datos en el sistema:
   - Moneda ($ 12.345,50) y conversión segura entre pesos y centavos enteros.
   - Fechas y horas en la zona horaria oficial de Argentina (America/Argentina/Buenos_Aires).
   - Numeración legal correlativa de facturas (0001-00000045) y recibos (R 0001-00000045).
   - Formateo de documentos con puntos (DNI 28.456.123) y guiones (CUIT 20-28456123-9).
   - Diccionarios de etiquetas legibles para medios de pago y tipos de movimientos.
   ========================================================================== */

/* zona horaria estándar de la República Argentina (UTC-3) */
export const ZONA_HORARIA = "America/Argentina/Buenos_Aires";

/* punto de venta oficial del local comercial de la ferretería */
export const PUNTO_DE_VENTA = 1;

/* formateador nativo de JavaScript para moneda argentina:
   - es-AR: configuración regional de Argentina (usa puntos para miles y comas para decimales)
   - ARS: pesos argentinos
   - minimumFractionDigits: 2 decimales obligatorios siempre */
const formatoMoneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

/* ==========================================================================
   FUNCIÓN: formatearMoneda
   ¿Para qué sirve? Convierte una cantidad entera de centavos guardada en la base de datos
   en un texto amigable para mostrar en pantalla o comprobantes impresos.
   Ejemplo: 1234550 centavos -> "$ 12.345,50"
   ========================================================================== */
export function formatearMoneda(centavos: number | null | undefined): string {
  /* si el valor es nulo o indefinido mostramos un guión de no disponible */
  if (centavos === null || centavos === undefined) return "—";
  
  /* dividimos por 100 para convertir de centavos a pesos y reemplazamos espacios especiales */
  return formatoMoneda.format(centavos / 100).replace(/\s/g, " ");
}

/* ==========================================================================
   FUNCIÓN: pesosACentavos
   ¿Para qué sirve? Convierte lo que el usuario tipea en un input (ej: "$ 12.345,50" o "12345.5")
   en el número entero de centavos exacto para guardar en la base de datos (1234550).
   Maneja formatos argentinos (coma decimal) y formatos de punto decimal.
   ========================================================================== */
export function pesosACentavos(textoPesos: string): number | null {
  /* limpiamos el signo de pesos y los espacios en blanco */
  const limpio = textoPesos.trim().replace(/\$/g, "").replace(/\s/g, "");
  if (limpio === "") return null;

  /* normalizamos el formato numérico soportando separador de miles argentino y decimales */
  let normalizado: string;
  if (limpio.includes(",")) {
    normalizado = limpio.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(limpio)) {
    normalizado = limpio.replace(/\./g, "");
  } else {
    normalizado = limpio;
  }
  const pesos = Number(normalizado);

  /* si no es un número válido devolvemos null */
  if (Number.isNaN(pesos)) return null;

  /* multiplicamos por 100 y redondeamos con Math.round() para evitar decimales flotantes */
  return Math.round(pesos * 100);
}

/* ==========================================================================
   FUNCIÓN: centavosATextoPesos
   ¿Para qué sirve? Convierte centavos en una cadena simple con coma para rellenar
   valores iniciales de inputs editables (ej: 1234550 -> "12345,50").
   ========================================================================== */
export function centavosATextoPesos(centavos: number | null | undefined): string {
  if (centavos === null || centavos === undefined) return "";
  return (centavos / 100).toFixed(2).replace(".", ",");
}

/* ==========================================================================
   FUNCIÓN: formatearFecha
   ¿Para qué sirve? Convierte una fecha a formato local de Argentina "DD/MM/AAAA".
   ========================================================================== */
export function formatearFecha(fecha: Date | string | number): string {
  return new Date(fecha).toLocaleDateString("es-AR", {
    timeZone: ZONA_HORARIA,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* ==========================================================================
   FUNCIÓN: formatearFechaHora
   ¿Para qué sirve? Convierte una fecha a "DD/MM/AAAA HH:MM" en hora de 24 hs.
   ========================================================================== */
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

/* ==========================================================================
   FUNCIÓN: diaArgentino
   ¿Para qué sirve? Devuelve la fecha en formato estricto "AAAA-MM-DD" según
   el calendario de Argentina, ideal para agrupar ventas o armar listas temporales.
   ========================================================================== */
export function diaArgentino(fecha: Date): string {
  return fecha.toLocaleDateString("en-CA", { timeZone: ZONA_HORARIA });
}

/* ==========================================================================
   FUNCIÓN: inicioDelDia
   ¿Para qué sirve? Toma un texto "AAAA-MM-DD" y devuelve el objeto Date
   correspondiente al primer milisegundo de ese día (00:00:00.000 en UTC-3).
   ========================================================================== */
export function inicioDelDia(diaTexto: string): Date {
  return new Date(`${diaTexto}T00:00:00-03:00`);
}

/* ==========================================================================
   FUNCIÓN: finDelDia
   ¿Para qué sirve? Toma un texto "AAAA-MM-DD" y devuelve el objeto Date
   correspondiente al último milisegundo de ese día (23:59:59.999 en UTC-3).
   ========================================================================== */
export function finDelDia(diaTexto: string): Date {
  return new Date(`${diaTexto}T23:59:59.999-03:00`);
}

/* ==========================================================================
   FUNCIÓN: formatearNumeroFactura
   ¿Para qué sirve? Formatea el número legal de la factura con ceros a la izquierda:
   - punto de venta: 4 dígitos (padStart(4, "0"))
   - número de comprobante: 8 dígitos (padStart(8, "0"))
   Ejemplo: puntoVenta 1, número 45 -> "0001-00000045"
   ========================================================================== */
export function formatearNumeroFactura(puntoVenta: number, numero: number): string {
  return `${String(puntoVenta).padStart(4, "0")}-${String(numero).padStart(8, "0")}`;
}

/* ==========================================================================
   FUNCIÓN: formatearNumeroRecibo
   ¿Para qué sirve? Formatea el número oficial de recibo anteponiendo la letra 'R '.
   Ejemplo: puntoVenta 1, número 12 -> "R 0001-00000012"
   ========================================================================== */
export function formatearNumeroRecibo(puntoVenta: number, numero: number): string {
  return `R ${formatearNumeroFactura(puntoVenta, numero)}`;
}

/* ==========================================================================
   FUNCIÓN: formatearDocumento
   ¿Para qué sirve? Aplica el formato visual correspondiente al tipo de documento:
   - CUIT: formato "XX-XXXXXXXX-X" (ej: "20-28456123-9")
   - DNI: formato con puntos de miles (ej: "28.456.123")
   ========================================================================== */
export function formatearDocumento(tipoDoc: string, nroDoc: string): string {
  const digitos = nroDoc.replace(/\D/g, "");
  if (tipoDoc === "CUIT" && digitos.length === 11) {
    return `${digitos.slice(0, 2)}-${digitos.slice(2, 10)}-${digitos.slice(10)}`;
  }
  return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/* ==========================================================================
   DICCIONARIOS DE ETIQUETAS LEGIBLES
   Mapean los valores internos de la base de datos a títulos en español para la vista.
   ========================================================================== */
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
