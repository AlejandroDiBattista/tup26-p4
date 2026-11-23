/* ==========================================================================
   ESQUEMAS DE VALIDACIÓN ZOD PARA CATEGORÍAS, PRODUCTOS Y STOCK (ESQUEMAS/PRODUCTOS.TS)
   Este módulo valida los artículos del catálogo y las operaciones manuales de inventario.
   
   REGLAS DE SEGURIDAD ARQUITECTÓNICAS:
   1. z.coerce: Convierte automáticamente strings numéricos que vienen de formularios HTML
      (como "<input type='number'>") en números reales de JavaScript.
   2. z.strictObject en edición de productos: Prohíbe terminantemente el campo 'existencia'.
      Si alguien intenta modificar el stock mediante un PUT o PATCH, Zod lo rechaza con error 422.
      El stock solo puede cambiar llamando al servicio de movimientos de stock.
   3. Validación cruzada en movimientos de stock (refine): Asegura que el motivo ingresado
      corresponda exactamente al tipo de operación (ingreso o egreso).
   ========================================================================== */

/* importamos la librería Zod */
import { z } from "zod";

/* ==========================================================================
   1. ESQUEMAS DE CATEGORÍAS
   ========================================================================== */

/* esquemaCategoriaNueva: valida que el nombre sea obligatorio y tenga hasta 40 caracteres */
export const esquemaCategoriaNueva = z.strictObject({
  nombre: z.string().trim().min(1, "Es obligatorio.").max(40, "Máximo 40 caracteres."),
});

/* esquemaCategoriaEdicion: permite actualizar el nombre o activar/desactivar la categoría */
export const esquemaCategoriaEdicion = z.strictObject({
  nombre: z.string().trim().min(1, "Es obligatorio.").max(40, "Máximo 40 caracteres.").optional(),
  activa: z.boolean().optional(),
});

/* ==========================================================================
   2. ESQUEMAS DE PRODUCTOS
   ========================================================================== */

/* esquemaProductoNuevo:
   - codigo: obligatorio, hasta 20 caracteres (ej: 'HE-001')
   - descripcion: obligatoria, hasta 120 caracteres
   - categoriaId: número entero positivo
   - precio: en CENTAVOS ENTEROS (ej: $100 se valida como 10000)
   - stockMinimo: entero mayor o igual a 0
   - stockInicial: entero opcional mayor o igual a 0 */
export const esquemaProductoNuevo = z.strictObject({
  codigo: z.string().trim().min(1, "Es obligatorio.").max(20, "Máximo 20 caracteres."),
  descripcion: z.string().trim().min(1, "Es obligatoria.").max(120, "Máximo 120 caracteres."),
  categoriaId: z.coerce.number().int().positive("Elegí una categoría."),
  precio: z.coerce.number().int("El precio debe estar en centavos.").positive("El precio debe ser mayor que cero."),
  stockMinimo: z.coerce.number().int("Debe ser un número entero.").min(0, "No puede ser negativo."),
  stockInicial: z.coerce.number().int("Debe ser un número entero.").min(0, "No puede ser negativo.").optional(),
});

/* esquemaProductoEdicion:
   Todos los campos son opcionales.
   IMPORTANTE: Al ser un strictObject, si un cliente malicioso intenta inyectar
   el campo "existencia" en el JSON, Zod lo rechaza con error 422 unrecognized_keys */
export const esquemaProductoEdicion = z.strictObject({
  codigo: z.string().trim().min(1, "Es obligatorio.").max(20, "Máximo 20 caracteres.").optional(),
  descripcion: z.string().trim().min(1, "Es obligatoria.").max(120, "Máximo 120 caracteres.").optional(),
  categoriaId: z.coerce.number().int().positive("Elegí una categoría.").optional(),
  precio: z.coerce.number().int("El precio debe estar en centavos.").positive("El precio debe ser mayor que cero.").optional(),
  stockMinimo: z.coerce.number().int("Debe ser un número entero.").min(0, "No puede ser negativo.").optional(),
  activo: z.boolean().optional(),
});

/* ==========================================================================
   3. MOVIMIENTOS MANUALES DE STOCK
   ========================================================================== */

/* motivos predefinidos permitidos para ingresos y egresos de mercadería */
export const MOTIVOS_INGRESO = ["Reposición", "Stock inicial", "Devolución de cliente"] as const;
export const MOTIVOS_EGRESO = ["Rotura", "Vencimiento", "Ajuste de inventario", "Uso interno"] as const;

/* esquemaMovimientoStock: valida que la cantidad sea un entero positivo y aplica .refine()
   para comprobar que si el tipo es 'ingreso', el motivo esté en MOTIVOS_INGRESO,
   y si es 'egreso', el motivo esté en MOTIVOS_EGRESO */
export const esquemaMovimientoStock = z
  .strictObject({
    tipo: z.enum(["ingreso", "egreso"], "Elegí ingreso o egreso."),
    cantidad: z.coerce.number().int("Debe ser un número entero.").positive("La cantidad debe ser mayor que cero."),
    motivo: z.string().trim().min(1, "El motivo es obligatorio."),
    observacion: z.string().trim().max(200).optional(),
  })
  .refine(
    (datos) => {
      const motivosValidos: readonly string[] = datos.tipo === "ingreso" ? MOTIVOS_INGRESO : MOTIVOS_EGRESO;
      return motivosValidos.includes(datos.motivo);
    },
    { message: "El motivo no corresponde al tipo de movimiento.", path: ["motivo"] },
  );
