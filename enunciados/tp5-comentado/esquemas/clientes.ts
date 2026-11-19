// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Esquemas de validación de clientes y pagos de cuenta corriente.
// [Línea 2] Importa elementos desde 'zod'.
import { z } from "zod";

// [Línea 4] Declara y exporta la constante 'TIPOS_DOCUMENTO'.
export const TIPOS_DOCUMENTO = ["DNI", "CUIT"] as const;
// [Línea 5] Declara y exporta la constante 'MEDIOS_PAGO'.
export const MEDIOS_PAGO = ["efectivo", "transferencia", "tarjeta_debito"] as const;

// Devuelve el mensaje de error del documento, o null si está bien.
// DNI: 7 u 8 dígitos. CUIT: 11 dígitos. Se ignoran puntos y guiones.
// [Línea 9] Declara la función o componente 'errorDeDocumento'.
export function errorDeDocumento(tipoDoc: string, nroDoc: string): string | null {
  // [Línea 10] Declara 'soloDigitos' y le asigna el valor resultante.
  const soloDigitos = nroDoc.replace(/\D/g, "");
  // [Línea 11] Verifica la condición: if (tipoDoc === "DNI" && !/^\d{7,8}$/.test(soloDigitos)) return "El DNI debe tener 7 u 8 dígitos.";
  if (tipoDoc === "DNI" && !/^\d{7,8}$/.test(soloDigitos)) return "El DNI debe tener 7 u 8 dígitos.";
  // [Línea 12] Verifica la condición: if (tipoDoc === "CUIT" && !/^\d{11}$/.test(soloDigitos)) return "El CUIT debe tener 11 dígitos.";
  if (tipoDoc === "CUIT" && !/^\d{11}$/.test(soloDigitos)) return "El CUIT debe tener 11 dígitos.";
  // [Línea 13] Devuelve el valor: null;
  return null;
// [Línea 14] Cierra el bloque o estructura (}).
}

// Campos comunes del alta y de la edición.
// [Línea 17] Declara 'campoEmail' y le asigna el valor resultante.
const campoEmail = z.union([z.literal(""), z.email("El email no es válido.")]).optional();
// [Línea 18] Declara 'campoLimite' y le asigna el valor resultante.
const campoLimite = z.number().int().min(0, "No puede ser negativo.").nullable().optional();

// POST /api/clientes  (la misma ruta que usa el alta rápida desde Nueva venta)
// [Línea 21] Declara y exporta la constante 'esquemaClienteNuevo'.
export const esquemaClienteNuevo = z
  // [Línea 22] Ejecuta o evalúa: .strictObject({
  .strictObject({
    // [Línea 23] Define o asigna el campo/parámetro 'tipoDoc'.
    tipoDoc: z.enum(TIPOS_DOCUMENTO, "Elegí DNI o CUIT."),
    // [Línea 24] Define o asigna el campo/parámetro 'nroDoc'.
    nroDoc: z.string().trim().min(1, "Es obligatorio."),
    // [Línea 25] Define o asigna el campo/parámetro 'nombre'.
    nombre: z.string().trim().min(1, "Es obligatorio.").max(100),
    // [Línea 26] Define o asigna el campo/parámetro 'domicilio'.
    domicilio: z.string().trim().max(120).optional(),
    // [Línea 27] Define o asigna el campo/parámetro 'telefono'.
    telefono: z.string().trim().max(40).optional(),
    // [Línea 28] Define o asigna el campo/parámetro 'email'.
    email: campoEmail,
    // [Línea 29] Define o asigna el campo/parámetro 'cuentaCorriente'.
    cuentaCorriente: z.boolean().optional(),
    // [Línea 30] Define o asigna el campo/parámetro 'limiteCredito'.
    limiteCredito: campoLimite,
  // [Línea 31] Cierra el bloque o estructura (})).
  })
  // [Línea 32] Ejecuta o evalúa: .superRefine((datos, contexto) => {
  .superRefine((datos, contexto) => {
    // [Línea 33] Declara 'mensaje' y le asigna el valor resultante.
    const mensaje = errorDeDocumento(datos.tipoDoc, datos.nroDoc);
    // [Línea 34] Verifica la condición: if (mensaje) contexto.addIssue({ code: "custom", path: ["nroDoc"], message: mensaje });
    if (mensaje) contexto.addIssue({ code: "custom", path: ["nroDoc"], message: mensaje });
  // [Línea 35] Cierra el bloque o estructura (});).
  });

// PATCH /api/clientes/{id}
// [Línea 38] Declara y exporta la constante 'esquemaClienteEdicion'.
export const esquemaClienteEdicion = z
  // [Línea 39] Ejecuta o evalúa: .strictObject({
  .strictObject({
    // [Línea 40] Define o asigna el campo/parámetro 'tipoDoc'.
    tipoDoc: z.enum(TIPOS_DOCUMENTO, "Elegí DNI o CUIT.").optional(),
    // [Línea 41] Define o asigna el campo/parámetro 'nroDoc'.
    nroDoc: z.string().trim().min(1, "Es obligatorio.").optional(),
    // [Línea 42] Define o asigna el campo/parámetro 'nombre'.
    nombre: z.string().trim().min(1, "Es obligatorio.").max(100).optional(),
    // [Línea 43] Define o asigna el campo/parámetro 'domicilio'.
    domicilio: z.string().trim().max(120).optional(),
    // [Línea 44] Define o asigna el campo/parámetro 'telefono'.
    telefono: z.string().trim().max(40).optional(),
    // [Línea 45] Define o asigna el campo/parámetro 'email'.
    email: campoEmail,
    // [Línea 46] Define o asigna el campo/parámetro 'cuentaCorriente'.
    cuentaCorriente: z.boolean().optional(),
    // [Línea 47] Define o asigna el campo/parámetro 'limiteCredito'.
    limiteCredito: campoLimite,
    // [Línea 48] Define o asigna el campo/parámetro 'activo'.
    activo: z.boolean().optional(),
  // [Línea 49] Cierra el bloque o estructura (})).
  })
  // [Línea 50] Ejecuta o evalúa: .superRefine((datos, contexto) => {
  .superRefine((datos, contexto) => {
    // [Línea 51] Verifica la condición: if (datos.tipoDoc && datos.nroDoc) {
    if (datos.tipoDoc && datos.nroDoc) {
      // [Línea 52] Declara 'mensaje' y le asigna el valor resultante.
      const mensaje = errorDeDocumento(datos.tipoDoc, datos.nroDoc);
      // [Línea 53] Verifica la condición: if (mensaje) contexto.addIssue({ code: "custom", path: ["nroDoc"], message: mensaje });
      if (mensaje) contexto.addIssue({ code: "custom", path: ["nroDoc"], message: mensaje });
    // [Línea 54] Cierra el bloque o estructura (}).
    }
  // [Línea 55] Cierra el bloque o estructura (});).
  });

// POST /api/clientes/{id}/pagos   (importe en CENTAVOS)
// [Línea 58] Define y exporta el esquema de validación Zod 'esquemaPagoNuevo' (compartido entre cliente y servidor).
export const esquemaPagoNuevo = z.strictObject({
  // [Línea 59] Define o asigna el campo/parámetro 'importe'.
  importe: z.number("Ingresá el importe.").int().positive("El importe debe ser mayor que cero."),
  // [Línea 60] Define o asigna el campo/parámetro 'medio'.
  medio: z.enum(MEDIOS_PAGO, "Elegí el medio de pago."),
  // [Línea 61] Define o asigna el campo/parámetro 'observacion'.
  observacion: z.string().trim().max(200).optional(),
// [Línea 62] Cierra el bloque o estructura (});).
});

// [Línea 64] Define el tipo de datos 'DatosClienteNuevo' en TypeScript.
export type DatosClienteNuevo = z.infer<typeof esquemaClienteNuevo>;
