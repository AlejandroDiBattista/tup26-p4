// Esquemas de validación de facturas (venta y anulación).
// Regla clave: El cliente NUNCA manda precios ni totales: solo productos y cantidades para evitar hackeos o alteraciones.

/* importamos la libreria Zod, que nos permite definir esquemas estrictos de validacion de datos tanto en el cliente como en el backend */
import { z } from "zod";

/* definimos arreglos inmutables con las opciones validas usando 'as const' para que typescript los reconozca como tipos literales exactos */
export const FORMAS_PAGO = ["contado", "tarjeta", "cuenta_corriente"] as const;
export const MARCAS_TARJETA = ["Visa", "Mastercard", "American Express", "Cabal", "Naranja"] as const;

/* REGLA 9 DE SEGURIDAD:
   Nunca debemos pedir ni almacenar los 16 digitos completos de una tarjeta ni su codigo de seguridad CVC.
   Usamos 'strictObject' para que si un usuario malintencionado intenta mandar un campo adicional como 'numero' o 'cvc', Zod rechace la peticion automaticamente con error 422.
*/
const esquemaTarjeta = z.strictObject({
  /* tipo: solo permite que el valor sea 'debito' o 'credito' */
  tipo: z.enum(["debito", "credito"], "Elegí débito o crédito."),
  /* marca: valida que no este vacio y limpia espacios a los lados */
  marca: z.string().trim().min(1, "Elegí la marca."),
  /* ultimos4: mediante una expresion regular ^\d{4}$ se asegura de que sean exactamente cuatro caracteres numericos */
  ultimos4: z.string().regex(/^\d{4}$/, "Deben ser exactamente 4 dígitos."),
});

/* DISCRIMINATED UNION:
   Es una funcion avanzada de Zod que valida distintos esquemas segun el valor de una propiedad discriminadora (en este caso 'forma').
   - Si la forma es 'contado', opcionalmente puede recibir el 'montoRecibido' en efectivo para calcular el vuelto.
   - Si la forma es 'tarjeta', es obligatorio que venga el sub-objeto 'tarjeta' con sus 4 digitos y marca.
   - Si la forma es 'cuenta_corriente', no requiere campos adicionales de pago porque se asienta a deuda.
*/
const esquemaPagoFactura = z.discriminatedUnion("forma", [
  z.strictObject({
    forma: z.literal("contado"),
    /* montoRecibido: debe ser un numero entero en centavos mayor a cero */
    montoRecibido: z.number().int().positive("El monto debe ser mayor que cero.").optional(),
  }),
  z.strictObject({
    forma: z.literal("tarjeta"),
    tarjeta: esquemaTarjeta,
  }),
  z.strictObject({
    forma: z.literal("cuenta_corriente"),
  }),
]);

/* esquema para cada item individual que se compra en el mostrador */
const esquemaItem = z.strictObject({
  /* productoId: identificador numerico unico del producto en la db */
  productoId: z.number().int().positive(),
  /* cantidad: valida que sea un numero entero y estrictamente mayor que cero (no se pueden vender cantidades negativas o fracciones) */
  cantidad: z.number().int("La cantidad debe ser entera.").positive("La cantidad debe ser mayor que cero."),
});

/* ESQUEMA PRINCIPAL DE NUEVA VENTA (POST /api/facturas) */
export const esquemaFacturaNueva = z.strictObject({
  /* clienteId: puede ser un numero entero positivo si es un cliente registrado, o null si es una venta a 'Consumidor Final' */
  clienteId: z.number().int().positive().nullable(),
  /* items: arreglo de productos que deben cumplir las siguientes condiciones: */
  items: z
    .array(esquemaItem)
    /* min(1): no se puede emitir una factura vacia sin productos */
    .min(1, "La venta debe tener al menos un producto.")
    /* refine: comprobacion personalizada usando un Set de javascript para verificar que no haya productos duplicados en la misma factura */
    .refine(
      (items) => new Set(items.map((item) => item.productoId)).size === items.length,
      "Hay productos repetidos.",
    ),
  /* pago: aplica la validacion segun la forma de pago explicada arriba */
  pago: esquemaPagoFactura,
});

/* esquema para la anulacion de una factura por parte de un administrador (POST /api/facturas/{id}/anulacion) */
export const esquemaAnulacion = z.strictObject({
  /* motivo: texto obligatorio que explica por que se anula el comprobante (para auditoria) */
  motivo: z.string("El motivo es obligatorio.").trim().min(1, "El motivo es obligatorio."),
});

/* inferimos el tipo de Typescript a partir del esquema Zod para tener autocompletado en todo el codigo sin duplicar interfaces */
export type DatosFacturaNueva = z.infer<typeof esquemaFacturaNueva>;
