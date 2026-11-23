/* ==========================================================================
   ESQUEMAS DE VALIDACIÓN ZOD PARA CLIENTES Y COBRANZAS (ESQUEMAS/CLIENTES.TS)
   Este módulo valida las entradas de datos antes de que toquen la base de datos:
   - Formato estricto de documentos argentinos (DNI de 7 a 8 dígitos, CUIT de 11 dígitos).
   - Alta de cliente nuevo (esquemaClienteNuevo).
   - Edición de cliente existente (esquemaClienteEdicion).
   - Registro de recibo de cobro en cuenta corriente (esquemaPagoNuevo con importe positivo en centavos).
   ========================================================================== */

/* importamos la librería Zod */
import { z } from "zod";

/* 'as const' fija estos arreglos como tuplas literales inmutables de solo lectura */
export const TIPOS_DOCUMENTO = ["DNI", "CUIT"] as const;
export const MEDIOS_PAGO = ["efectivo", "transferencia", "tarjeta_debito"] as const;

/* ==========================================================================
   FUNCIÓN: errorDeDocumento
   ¿Para qué sirve? Limpia caracteres especiales y comprueba las reglas de formato argentinas:
   - DNI: exactamente 7 u 8 dígitos numéricos.
   - CUIT: exactamente 11 dígitos numéricos.
   Si es válido devuelve null; si no cumple, devuelve el mensaje de error explicativo.
   ========================================================================== */
export function errorDeDocumento(tipoDoc: string, nroDoc: string): string | null {
  /* extraemos únicamente los dígitos ignorando puntos, espacios y guiones con expresión regular */
  const soloDigitos = nroDoc.replace(/\D/g, "");
  
  if (tipoDoc === "DNI" && !/^\d{7,8}$/.test(soloDigitos)) return "El DNI debe tener 7 u 8 dígitos.";
  if (tipoDoc === "CUIT" && !/^\d{11}$/.test(soloDigitos)) return "El CUIT debe tener 11 dígitos.";
  
  return null;
}

/* campoEmail: acepta una cadena vacía "" (opcional) o un email válido con formato correcto */
const campoEmail = z.union([z.literal(""), z.email("El email no es válido.")]).optional();

/* campoLimite: número entero mayor o igual a 0 en centavos, puede ser null (sin límite) u omitido */
const campoLimite = z.number().int().min(0, "No puede ser negativo.").nullable().optional();

/* ==========================================================================
   ESQUEMA: esquemaClienteNuevo (POST /api/clientes)
   Valida el formulario de creación de un cliente nuevo.
   Usa 'strictObject' para rechazar cualquier propiedad inesperada y 'superRefine'
   para ejecutar la función personalizada errorDeDocumento sobre el campo nroDoc.
   ========================================================================== */
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
    /* validamos el documento según el tipo elegido */
    const mensaje = errorDeDocumento(datos.tipoDoc, datos.nroDoc);
    if (mensaje) contexto.addIssue({ code: "custom", path: ["nroDoc"], message: mensaje });
  });

/* ==========================================================================
   ESQUEMA: esquemaClienteEdicion (PATCH /api/clientes/{id})
   Todos los campos son opcionales porque en una edición parcial solo se envían
   los campos que el usuario modificó en la pantalla.
   ========================================================================== */
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

/* ==========================================================================
   ESQUEMA: esquemaPagoNuevo (POST /api/clientes/{id}/pagos)
   Valida el cobro de un recibo en cuenta corriente:
   - importe: número entero mayor a 0 (en centavos).
   - medio: 'efectivo', 'transferencia' o 'tarjeta_debito'.
   - observacion: texto opcional de hasta 200 caracteres.
   ========================================================================== */
export const esquemaPagoNuevo = z.strictObject({
  importe: z.number("Ingresá el importe.").int().positive("El importe debe ser mayor que cero."),
  medio: z.enum(MEDIOS_PAGO, "Elegí el medio de pago."),
  observacion: z.string().trim().max(200).optional(),
});

/* inferimos el tipo de TypeScript a partir del esquema */
export type DatosClienteNuevo = z.infer<typeof esquemaClienteNuevo>;
