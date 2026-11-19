// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Esquemas de validación de facturas (venta y anulación).
// El cliente NUNCA manda precios ni totales: solo productos y cantidades.
// [Línea 3] Importa elementos desde 'zod'.
import { z } from "zod";

// [Línea 5] Declara y exporta la constante 'FORMAS_PAGO'.
export const FORMAS_PAGO = ["contado", "tarjeta", "cuenta_corriente"] as const;
// [Línea 6] Declara y exporta la constante 'MARCAS_TARJETA'.
export const MARCAS_TARJETA = ["Visa", "Mastercard", "American Express", "Cabal", "Naranja"] as const;

// Datos de la tarjeta: solo tipo, marca y últimos 4 dígitos (regla 9).
// Es strict: si llega un campo "numero" con la tarjeta completa, se rechaza con 422.
// [Línea 10] Declara 'esquemaTarjeta' y le asigna el valor resultante.
const esquemaTarjeta = z.strictObject({
  // [Línea 11] Define o asigna el campo/parámetro 'tipo'.
  tipo: z.enum(["debito", "credito"], "Elegí débito o crédito."),
  // [Línea 12] Define o asigna el campo/parámetro 'marca'.
  marca: z.string().trim().min(1, "Elegí la marca."),
  // [Línea 13] Define o asigna el campo/parámetro 'ultimos4'.
  ultimos4: z.string().regex(/^\d{4}$/, "Deben ser exactamente 4 dígitos."),
// [Línea 14] Cierra el bloque o estructura (});).
});

// La forma de pago define qué datos extra se piden.
// [Línea 17] Declara 'esquemaPagoFactura' y le asigna el valor resultante.
const esquemaPagoFactura = z.discriminatedUnion("forma", [
  // [Línea 18] Ejecuta o evalúa: z.strictObject({
  z.strictObject({
    // [Línea 19] Define o asigna el campo/parámetro 'forma'.
    forma: z.literal("contado"),
    // [Línea 20] Define o asigna el campo/parámetro 'montoRecibido'.
    montoRecibido: z.number().int().positive("El monto debe ser mayor que cero.").optional(),
  // [Línea 21] Ejecuta o evalúa: }),
  }),
  // [Línea 22] Ejecuta o evalúa: z.strictObject({
  z.strictObject({
    // [Línea 23] Define o asigna el campo/parámetro 'forma'.
    forma: z.literal("tarjeta"),
    // [Línea 24] Define o asigna el campo/parámetro 'tarjeta'.
    tarjeta: esquemaTarjeta,
  // [Línea 25] Ejecuta o evalúa: }),
  }),
  // [Línea 26] Ejecuta o evalúa: z.strictObject({
  z.strictObject({
    // [Línea 27] Define o asigna el campo/parámetro 'forma'.
    forma: z.literal("cuenta_corriente"),
  // [Línea 28] Ejecuta o evalúa: }),
  }),
// [Línea 29] Cierra el bloque o estructura (]);).
]);

// [Línea 31] Declara 'esquemaItem' y le asigna el valor resultante.
const esquemaItem = z.strictObject({
  // [Línea 32] Define o asigna el campo/parámetro 'productoId'.
  productoId: z.number().int().positive(),
  // [Línea 33] Define o asigna el campo/parámetro 'cantidad'.
  cantidad: z.number().int("La cantidad debe ser entera.").positive("La cantidad debe ser mayor que cero."),
// [Línea 34] Cierra el bloque o estructura (});).
});

// POST /api/facturas
// [Línea 37] Define y exporta el esquema de validación Zod 'esquemaFacturaNueva' (compartido entre cliente y servidor).
export const esquemaFacturaNueva = z.strictObject({
  // [Línea 38] Define o asigna el campo/parámetro 'clienteId'.
  clienteId: z.number().int().positive().nullable(), // null = consumidor final
  // [Línea 39] Define o asigna el campo/parámetro 'items'.
  items: z
    // [Línea 40] Ejecuta o evalúa: .array(esquemaItem)
    .array(esquemaItem)
    // [Línea 41] Ejecuta o evalúa: .min(1, "La venta debe tener al menos un producto.")
    .min(1, "La venta debe tener al menos un producto.")
    // [Línea 42] Ejecuta o evalúa: .refine(
    .refine(
      // [Línea 43] Ejecuta o evalúa: (items) => new Set(items.map((item) => item.productoId)).size === items.length,
      (items) => new Set(items.map((item) => item.productoId)).size === items.length,
      // [Línea 44] Ejecuta o evalúa: "Hay productos repetidos.",
      "Hay productos repetidos.",
    // [Línea 45] Cierra el bloque o estructura (),).
    ),
  // [Línea 46] Define o asigna el campo/parámetro 'pago'.
  pago: esquemaPagoFactura,
// [Línea 47] Cierra el bloque o estructura (});).
});

// POST /api/facturas/{id}/anulacion
// [Línea 50] Define y exporta el esquema de validación Zod 'esquemaAnulacion' (compartido entre cliente y servidor).
export const esquemaAnulacion = z.strictObject({
  // [Línea 51] Define o asigna el campo/parámetro 'motivo'.
  motivo: z.string("El motivo es obligatorio.").trim().min(1, "El motivo es obligatorio."),
// [Línea 52] Cierra el bloque o estructura (});).
});

// [Línea 54] Define el tipo de datos 'DatosFacturaNueva' en TypeScript.
export type DatosFacturaNueva = z.infer<typeof esquemaFacturaNueva>;
