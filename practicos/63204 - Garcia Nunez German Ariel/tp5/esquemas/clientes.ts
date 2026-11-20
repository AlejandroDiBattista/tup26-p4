// Esquemas de validación de clientes y pagos de cuenta corriente.
import { z } from "zod";

export const TIPOS_DOCUMENTO = ["DNI", "CUIT"] as const;
export const MEDIOS_PAGO = ["efectivo", "transferencia", "tarjeta_debito"] as const;

// Devuelve el mensaje de error del documento, o null si está bien.
// DNI: 7 u 8 dígitos. CUIT: 11 dígitos. Se ignoran puntos y guiones.
export function errorDeDocumento(tipoDoc: string, nroDoc: string): string | null {
  const soloDigitos = nroDoc.replace(/\D/g, "");
  if (tipoDoc === "DNI" && !/^\d{7,8}$/.test(soloDigitos)) return "El DNI debe tener 7 u 8 dígitos.";
  if (tipoDoc === "CUIT" && !/^\d{11}$/.test(soloDigitos)) return "El CUIT debe tener 11 dígitos.";
  return null;
}

// Campos comunes del alta y de la edición.
const campoEmail = z.union([z.literal(""), z.email("El email no es válido.")]).optional();
const campoLimite = z.number().int().min(0, "No puede ser negativo.").nullable().optional();

// POST /api/clientes  (la misma ruta que usa el alta rápida desde Nueva venta)
export const esquemaClienteNuevo = z
  .strictObject({
    tipoDoc: z.enum(TIPOS_DOCUMENTO, "Elegí DNI o CUIT."),
    nroDoc: z.string().trim().min(1, "Es obligatorio."),
    nombre: z.string().trim().min(1, "Es obligatorio.").max(100),
    domicilio: z.string().trim().max(120).optional(),
    telefono: z.string().trim().max(40).optional(),
    email: campoEmail,
    cuentaCorriente: z.boolean().optional(),
    limiteCredito: campoLimite,
  })
  .superRefine((datos, contexto) => {
    const mensaje = errorDeDocumento(datos.tipoDoc, datos.nroDoc);
    if (mensaje) contexto.addIssue({ code: "custom", path: ["nroDoc"], message: mensaje });
  });

// PATCH /api/clientes/{id}
export const esquemaClienteEdicion = z
  .strictObject({
    tipoDoc: z.enum(TIPOS_DOCUMENTO, "Elegí DNI o CUIT.").optional(),
    nroDoc: z.string().trim().min(1, "Es obligatorio.").optional(),
    nombre: z.string().trim().min(1, "Es obligatorio.").max(100).optional(),
    domicilio: z.string().trim().max(120).optional(),
    telefono: z.string().trim().max(40).optional(),
    email: campoEmail,
    cuentaCorriente: z.boolean().optional(),
    limiteCredito: campoLimite,
    activo: z.boolean().optional(),
  })
  .superRefine((datos, contexto) => {
    if (datos.tipoDoc && datos.nroDoc) {
      const mensaje = errorDeDocumento(datos.tipoDoc, datos.nroDoc);
      if (mensaje) contexto.addIssue({ code: "custom", path: ["nroDoc"], message: mensaje });
    }
  });

// POST /api/clientes/{id}/pagos   (importe en CENTAVOS)
export const esquemaPagoNuevo = z.strictObject({
  importe: z.number("Ingresá el importe.").int().positive("El importe debe ser mayor que cero."),
  medio: z.enum(MEDIOS_PAGO, "Elegí el medio de pago."),
  observacion: z.string().trim().max(200).optional(),
});

export type DatosClienteNuevo = z.infer<typeof esquemaClienteNuevo>;
